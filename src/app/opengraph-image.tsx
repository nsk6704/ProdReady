import { ImageResponse } from "next/og"
import { getSpaceGroteskFonts } from "@/lib/og-utils"

export const runtime = "nodejs"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image() {
  const fonts = await getSpaceGroteskFonts()

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#fff",
          fontFamily: "Space Grotesk",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 80,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 80,
            height: 80,
            borderRadius: 20,
            background: "#f59e0b",
            color: "#fff",
            fontSize: 40,
            fontWeight: 700,
            marginBottom: 28,
          }}
        >
          P
        </div>
        <div style={{ fontSize: 72, fontWeight: 700, color: "#111", marginBottom: 16, letterSpacing: "-0.02em" }}>
          ProdReady
        </div>
        <div style={{ fontSize: 28, color: "#666", textAlign: "center", maxWidth: 640, lineHeight: 1.4 }}>
          Is your side project production ready? Paste a GitHub repo and find out.
        </div>
      </div>
    ),
    { ...size, fonts },
  )
}
