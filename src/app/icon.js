import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b0714",
          borderRadius: 14,
          fontFamily: "monospace",
        }}
      >
        <span style={{ color: "#b794f6", fontSize: 34, fontWeight: 700 }}>P/</span>
      </div>
    ),
    { ...size }
  );
}
