import { ImageResponse } from "next/og"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#fff",
          fontFamily: "system-ui, sans-serif",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 80,
        }}
      >
        <div style={{ fontSize: 80, fontWeight: 800, color: "#f59e0b", marginBottom: 20 }}>
          ProdReady
        </div>
        <div style={{ fontSize: 36, color: "#333", textAlign: "center", maxWidth: 700 }}>
          Is your side project production ready? Paste a GitHub repo and find out.
        </div>
      </div>
    ),
    size,
  )
}
