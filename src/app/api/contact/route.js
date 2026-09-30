import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { buildOwnerEmail, buildSenderEmail } from "@/lib/emailTemplates";

export const runtime = "nodejs";

const LIMIT = 3;                    // messages per IP
const WINDOW_MS = 60 * 60 * 1000;   // per hour
const hits = new Map();             // in-memory; resets on restart (fine for a portfolio)

const getIP = (req) =>
  req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";

function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= LIMIT) { hits.set(ip, recent); return true; }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }

  const name = String(body?.name ?? "").trim();
  const email = String(body?.email ?? "").trim();
  const message = String(body?.message ?? "").trim();

  // Honeypot: real users never fill this hidden field. Pretend success so bots learn nothing.
  if (body?.website) return NextResponse.json({ ok: true });

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Please fill in your name, email and message." }, { status: 400 });
  }
  if (name.length > 100 || email.length > 200 || message.length > 5000) {
    return NextResponse.json({ error: "One of the fields is too long." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (/[\r\n]/.test(name) || /[\r\n]/.test(email)) {   // header-injection guard
    return NextResponse.json({ error: "Invalid characters in name or email." }, { status: 400 });
  }

  if (rateLimited(getIP(request))) {
    return NextResponse.json({ error: "Too many messages. Please try again in an hour." }, { status: 429 });
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, RECIPIENT_EMAIL } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !RECIPIENT_EMAIL) {
    console.error("Contact form: SMTP env vars are missing.");
    return NextResponse.json({ error: "Email is not configured on the server." }, { status: 500 });
  }

  const port = Number(SMTP_PORT) || 587;
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  const owner = buildOwnerEmail({ name, email, message });
  const sender = buildSenderEmail({ name, message });
  const safeName = name.replace(/"/g, "");

  // Sent in parallel to keep the wait short. The owner notification is what matters: if it fails the
  // visitor sees an error. If only the visitor's confirmation fails, it is logged and the visitor still
  // sees success (the owner already has the message).
  const [ownerRes, senderRes] = await Promise.allSettled([
    transporter.sendMail({
      from: `"Portfolio Contact" <${SMTP_USER}>`,
      to: RECIPIENT_EMAIL,
      replyTo: `"${safeName}" <${email}>`,   // replying goes straight to the visitor
      subject: owner.subject,
      text: owner.text,
      html: owner.html,
    }),
    transporter.sendMail({
      from: `"Pradeep Kumar S" <${SMTP_USER}>`,
      to: `"${safeName}" <${email}>`,
      replyTo: RECIPIENT_EMAIL,               // the visitor's reply reaches you
      subject: sender.subject,
      text: sender.text,
      html: sender.html,
    }),
  ]);

  if (senderRes.status === "rejected") {
    console.error("Contact form: confirmation email failed —", senderRes.reason?.code || senderRes.reason?.message);
  }
  if (ownerRes.status === "rejected") {
    console.error("Contact form: owner email failed —", ownerRes.reason?.code || ownerRes.reason?.message);
    return NextResponse.json({ error: "Could not send your message. Please try again later." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
