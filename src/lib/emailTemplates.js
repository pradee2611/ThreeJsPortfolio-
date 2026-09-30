// Responsive, table-based HTML emails (renders in Gmail, Outlook, Apple Mail, mobile).
// Purple theme to match the portfolio: violet #7c3aed + lavender #b794f6 on deep ink.
// The "P/S" monogram is pure HTML/CSS — no image attachment, so nothing to block or break.

const PURPLE = "#7c3aed";
const VIOLET = "#b794f6";
const DEEP = "#160c2c";
const INK = "#1e1433";
const MUTED = "#6b6285";
const LINE = "#e9e2fb";
const TINT = "#f5f0ff";
const FONT = "'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const SERIF = "Georgia, 'Times New Roman', serif";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL && !/localhost/.test(process.env.NEXT_PUBLIC_SITE_URL)
  ? process.env.NEXT_PUBLIC_SITE_URL
  : "https://pradeepportfolio-lovat.vercel.app";

const LINKS = [
  { label: "Portfolio", href: SITE_URL },
  { label: "LinkedIn", href: "https://linkedin.com/in/pradeep-kumar-selvam" },
  { label: "GitHub", href: "https://github.com/pradee2611" },
  { label: "Hugging Face", href: "https://huggingface.co/Pradee26112001" },
];

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const nl2br = (s) => esc(s).replace(/\r?\n/g, "<br>");
const firstName = (n) => String(n).trim().split(/\s+/)[0] || "there";

function button(label, href, color, outline = false) {
  const style = outline
    ? `background:transparent;border:1px solid ${VIOLET};color:${PURPLE}`
    : `background:${color};color:#ffffff`;
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" class="btn-table" style="display:inline-table;margin:0 8px 10px 0">
      <tr>
        <td class="btn-cell" align="center" bgcolor="${outline ? "#ffffff" : color}" style="border-radius:999px;background:${outline ? "#ffffff" : color}">
          <a href="${esc(href)}" target="_blank" style="display:inline-block;padding:13px 26px;font-family:${FONT};font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;text-decoration:none;border-radius:999px;${style}">${esc(label)}</a>
        </td>
      </tr>
    </table>`;
}

function shell({ preheader, eyebrow, title, bodyHtml }) {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${esc(String(title).replace(/<[^>]*>/g, "").replace(/&mdash;/g, "—"))}</title>
<style>
  body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
  table,td{mso-table-lspace:0;mso-table-rspace:0}
  img{-ms-interpolation-mode:bicubic;border:0;outline:none;text-decoration:none}
  body{margin:0!important;padding:0!important;width:100%!important;background:#0b0714}
  a{color:${PURPLE}}
  @media only screen and (max-width:620px){
    .container{width:100%!important}
    .px{padding-left:22px!important;padding-right:22px!important}
    .brand-name{font-size:17px!important}
    .h1{font-size:25px!important;line-height:1.15!important}
    .row-label,.row-value{display:block!important;width:100%!important}
    .row-label{padding-bottom:2px!important}
    .btn-table,.btn-cell{display:block!important;width:100%!important}
    .btn-cell a{display:block!important;text-align:center!important}
    .btn-table{margin-right:0!important}
  }
</style>
</head>
<body style="margin:0;padding:0;background:#0b0714">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;font-size:1px;line-height:1px">${esc(preheader)}&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0b0714" style="background:#0b0714">
    <tr>
      <td align="center" style="padding:28px 12px">
        <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px">

          <!-- violet / lavender top bar -->
          <tr>
            <td style="border-radius:16px 16px 0 0;overflow:hidden">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="64%" height="6" bgcolor="${PURPLE}" style="background:${PURPLE};height:6px;line-height:6px;font-size:0;border-radius:16px 0 0 0">&nbsp;</td>
                  <td width="36%" height="6" bgcolor="${VIOLET}" style="background:${VIOLET};height:6px;line-height:6px;font-size:0;border-radius:0 16px 0 0">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- header -->
          <tr>
            <td class="px" bgcolor="${DEEP}" style="background:${DEEP};background-image:linear-gradient(135deg,#1e1040 0%,#160c2c 60%,#2a1466 100%);padding:26px 32px">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="64" valign="middle" style="width:64px">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" valign="middle" bgcolor="${PURPLE}" width="58" height="58" style="width:58px;height:58px;background:${PURPLE};background-image:linear-gradient(135deg,${PURPLE},#a06bff);border-radius:16px;font-family:${SERIF};font-size:22px;font-weight:700;color:#ffffff;letter-spacing:0.02em">P<span style="color:#dccbff">/</span>S</td>
                      </tr>
                    </table>
                  </td>
                  <td valign="middle" style="padding-left:16px">
                    <div class="brand-name" style="font-family:${SERIF};font-size:22px;font-weight:400;letter-spacing:0.01em;color:#ffffff">Pradeep <em style="font-style:italic">Kumar S</em></div>
                    <div style="font-family:${FONT};font-size:11px;letter-spacing:0.16em;color:${VIOLET};text-transform:uppercase;padding-top:5px">Full-Stack &amp; Agentic AI Developer</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- body -->
          <tr>
            <td class="px" bgcolor="#ffffff" style="background:#ffffff;padding:34px 32px 8px">
              <div style="font-family:${FONT};font-size:11px;font-weight:800;letter-spacing:0.28em;color:${PURPLE};text-transform:uppercase;padding-bottom:10px">${esc(eyebrow)}</div>
              <h1 class="h1" style="margin:0 0 18px;font-family:${SERIF};font-size:30px;line-height:1.15;font-weight:400;color:${INK}">${title}</h1>
              ${bodyHtml}
            </td>
          </tr>

          <!-- footer -->
          <tr>
            <td class="px" bgcolor="${DEEP}" align="center" style="background:${DEEP};padding:24px 32px;border-radius:0 0 16px 16px">
              <div style="font-family:${FONT};font-size:13px;color:#cdbdf5;padding-bottom:10px">
                ${LINKS.map((l) => `<a href="${l.href}" target="_blank" style="color:${VIOLET};text-decoration:none;font-weight:700;margin:0 8px;display:inline-block">${l.label}</a>`).join("")}
              </div>
              <div style="font-family:${FONT};font-size:11px;line-height:1.6;color:#9a8cc0">
                Sent from the contact form on Pradeep Kumar S&rsquo;s portfolio &middot; Coimbatore, India
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function infoRow(label, valueHtml) {
  return `
    <tr>
      <td class="row-label" valign="top" width="110" style="width:110px;padding:10px 0;border-bottom:1px solid ${LINE};font-family:${FONT};font-size:11px;font-weight:800;letter-spacing:0.16em;color:${MUTED};text-transform:uppercase">${label}</td>
      <td class="row-value" valign="top" style="padding:10px 0;border-bottom:1px solid ${LINE};font-family:${FONT};font-size:15px;color:${INK};font-weight:600">${valueHtml}</td>
    </tr>`;
}

function messageBox(label, message, accent) {
  return `
    <div style="font-family:${FONT};font-size:11px;font-weight:800;letter-spacing:0.16em;color:${MUTED};text-transform:uppercase;padding:22px 0 8px">${label}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td bgcolor="${TINT}" style="background:${TINT};border-left:4px solid ${accent};border-radius:0 12px 12px 0;padding:18px 20px;font-family:${FONT};font-size:15px;line-height:1.65;color:${INK}">${nl2br(message)}</td>
      </tr>
    </table>`;
}

/** Email that lands in YOUR inbox. */
export function buildOwnerEmail({ name, email, message, receivedAt = new Date() }) {
  const when = receivedAt.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short",
  }) + " IST";
  const subject = `New portfolio message from ${name}`;

  const bodyHtml = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${LINE}">
      ${infoRow("Name", esc(name))}
      ${infoRow("Email", `<a href="mailto:${esc(email)}" style="color:${PURPLE};text-decoration:none;font-weight:700">${esc(email)}</a>`)}
      ${infoRow("Received", esc(when))}
    </table>
    ${messageBox("Message", message, PURPLE)}
    <div style="padding:26px 0 26px">
      ${button(`Reply to ${firstName(name)}`, `mailto:${email}?subject=${encodeURIComponent("Re: your message on my portfolio")}`, PURPLE)}
    </div>
    <div style="font-family:${FONT};font-size:12px;line-height:1.6;color:${MUTED};padding-bottom:26px">
      Hitting reply on this email also goes straight to ${esc(name)}.
    </div>`;

  const html = shell({
    preheader: `${name} wrote: ${message.slice(0, 90)}`,
    eyebrow: "New message",
    title: `${esc(name)} sent you a <em style="font-style:italic;color:${PURPLE}">message</em>`,
    bodyHtml,
  });

  const text = `New portfolio message\n\nName: ${name}\nEmail: ${email}\nReceived: ${when}\n\n${message}\n`;
  return { subject, html, text };
}

/** Confirmation that goes to the VISITOR who filled in the form. */
export function buildSenderEmail({ name, message }) {
  const subject = "Thanks for reaching out — I got your message";
  const excerpt = message.length > 280 ? message.slice(0, 280).trimEnd() + "…" : message;

  const bodyHtml = `
    <p style="margin:0 0 14px;font-family:${FONT};font-size:16px;line-height:1.65;color:${INK}">
      Hi ${esc(firstName(name))}, thanks for getting in touch. Your message has reached me safely.
    </p>
    <p style="margin:0 0 4px;font-family:${FONT};font-size:16px;line-height:1.65;color:${INK}">
      I read every message personally and will reply to this email address, usually within <strong style="color:${PURPLE}">1&ndash;2 days</strong>.
    </p>
    ${messageBox("A copy of what you sent", excerpt, VIOLET)}
    <div style="font-family:${FONT};font-size:11px;font-weight:800;letter-spacing:0.16em;color:${MUTED};text-transform:uppercase;padding:26px 0 12px">In the meantime</div>
    <div style="padding-bottom:6px">
      ${LINKS.map((l, i) => button(l.label, l.href, PURPLE, i !== 0)).join("")}
    </div>
    <p style="margin:12px 0 4px;font-family:${FONT};font-size:16px;line-height:1.65;color:${INK}">Talk soon,</p>
    <p style="margin:0 0 26px;font-family:${FONT};font-size:16px;line-height:1.5;color:${INK}">
      <strong>Pradeep Kumar S</strong><br>
      <span style="color:${MUTED};font-size:13px">Full-Stack (MERN) &amp; Agentic AI Developer</span>
    </p>
    <div style="border-top:1px solid ${LINE};padding:16px 0 26px;font-family:${FONT};font-size:12px;line-height:1.6;color:${MUTED}">
      This is an automatic confirmation, but you can simply reply to this email to reach me directly.
      If you didn&rsquo;t send a message through my portfolio, you can ignore this email.
    </div>`;

  const html = shell({
    preheader: "Your message reached me — I'll reply within 1–2 days.",
    eyebrow: "Message received",
    title: `Thanks, ${esc(firstName(name))} &mdash; I got your <em style="font-style:italic;color:${PURPLE}">message</em>`,
    bodyHtml,
  });

  const text =
    `Hi ${firstName(name)},\n\nThanks for getting in touch. Your message has reached me safely. ` +
    `I read every message personally and will reply to this address, usually within 1-2 days.\n\n` +
    `A copy of what you sent:\n${excerpt}\n\n` +
    `Talk soon,\nPradeep Kumar S\nFull-Stack (MERN) & Agentic AI Developer\n` +
    LINKS.map((l) => `${l.label}: ${l.href}`).join("\n") +
    `\n\n(This is an automatic confirmation — reply to this email to reach me directly. ` +
    `If you didn't send a message through my portfolio, ignore this email.)\n`;
  return { subject, html, text };
}
