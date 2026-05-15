import { ImageResponse } from "next/og"
import { prisma } from "@/lib/prisma"
import { getSpaceGroteskFonts } from "@/lib/og-utils"

export const runtime = "nodejs"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [scan, fonts] = await Promise.all([
    prisma.scan.findUnique({ where: { id } }),
    getSpaceGroteskFonts(),
  ])

  if (!scan) {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            background: "#fff",
            fontFamily: "Space Grotesk",
            fontSize: 48,
          }}
        >
          Report Not Found
        </div>
      ),
      { ...size, fonts },
    )
  }

  const scoreColor =
    scan.score >= 80 ? "#16a34a" : scan.score >= 50 ? "#f59e0b" : "#dc2626"

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#fff",
          fontFamily: "Space Grotesk",
          padding: 80,
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "#f59e0b",
              color: "#fff",
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            P
          </div>
          <div style={{ fontSize: 24, fontWeight: 600, color: "#f59e0b" }}>
            ProdReady
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: 56,
                fontWeight: 700,
                color: "#111",
                marginBottom: 10,
                letterSpacing: "-0.02em",
              }}
            >
              {scan.owner}/{scan.name}
            </div>
            <div style={{ fontSize: 24, color: "#888" }}>
              Production Readiness Report
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ fontSize: 86, fontWeight: 700, color: scoreColor, lineHeight: 1 }}>
              {scan.score}
            </div>
            <div style={{ fontSize: 20, color: scoreColor, marginTop: 4, fontWeight: 600 }}>/ 100</div>
          </div>
        </div>

        {scan.badges.length > 0 && (
          <div style={{ display: "flex", gap: 12, marginTop: 48, flexWrap: "wrap" }}>
            {(scan.badges as string[]).slice(0, 5).map((badge) => (
              <div
                key={badge}
                style={{
                  padding: "8px 20px",
                  borderRadius: 999,
                  fontSize: 18,
                  fontWeight: 600,
                  background: "#f5f5f5",
                  color: "#444",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {badge}
              </div>
            ))}
          </div>
        )}
      </div>
    ),
    { ...size, fonts },
  )
}
