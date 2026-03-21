import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Lingyou — Apprends une langue pour de vrai";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #0a1628 0%, #142a47 50%, #1a3a5c 100%)",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(56,189,248,0.15) 0%, transparent 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "90px",
            height: "90px",
            borderRadius: "50%",
            border: "3px solid rgba(56,189,248,0.6)",
            marginBottom: "24px",
            fontSize: "44px",
          }}
        >
          🌍
        </div>
        <div
          style={{
            fontSize: "72px",
            fontWeight: 800,
            letterSpacing: "8px",
            color: "white",
            textTransform: "uppercase",
            marginBottom: "16px",
            display: "flex",
          }}
        >
          LINGYOU
        </div>
        <div
          style={{
            fontSize: "28px",
            color: "rgba(255,255,255,0.8)",
            display: "flex",
          }}
        >
          Apprends une langue, pour de vrai
        </div>
      </div>
    ),
    { ...size }
  );
}
