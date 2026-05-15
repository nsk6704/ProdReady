import { ImageResponse } from "next/og"
import { prisma } from "@/lib/prisma"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const scan = await prisma.scan.findUnique({ where: { id } })
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
            fontSize: 48,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          Report Not Found
        </div>
      ),
      size,
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
          fontFamily: "system-ui, sans-serif",
          padding: 80,
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div style={{ fontSize: 32, fontWeight: 700, color: "#f59e0b", marginBottom: 40 }}>
          ProdReady
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 64, fontWeight: 700, color: "#111", marginBottom: 12 }}>
              {scan.owner}/{scan.name}
            </div>
            <div style={{ fontSize: 28, color: "#666" }}>Production Readiness Report</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ fontSize: 96, fontWeight: 800, color: scoreColor, lineHeight: 1 }}>
              {scan.score}
            </div>
            <div style={{ fontSize: 24, color: scoreColor, marginTop: 4 }}>/ 100</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 16, marginTop: 60, flexWrap: "wrap" }}>
          {(scan.badges as string[]).slice(0, 5).map((badge) => (
            <div
              key={badge}
              style={{
                padding: "8px 20px",
                borderRadius: 999,
                fontSize: 20,
                background: "#f5f5f5",
                color: "#333",
              }}
            >
              {badge}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  )
}
