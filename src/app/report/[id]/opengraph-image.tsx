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
      </div>,
      { ...size, fonts },
    )
  }

  const scoreColor =
    scan.score >= 80 ? "#16a34a" : scan.score >= 50 ? "#f59e0b" : "#dc2626"

  const repoName = scan.owner + "/" + scan.name

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background: "#fff",
        fontFamily: "Space Grotesk",
        paddingTop: 80,
        paddingBottom: 80,
        paddingLeft: 80,
        paddingRight: 80,
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: 40,
        }}
      >
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
            marginRight: 12,
          }}
        >
          P
        </div>
          <span style={{ fontSize: 24, fontWeight: 600, color: "#f59e0b" }}>
            ProdReady
          </span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: "#111",
              marginBottom: 10,
            }}
          >
            {repoName}
          </span>
          <span style={{ fontSize: 24, color: "#888" }}>
            Production Readiness Report
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: 86,
              fontWeight: 700,
              color: scoreColor,
              lineHeight: 1,
            }}
          >
            {scan.score}
          </span>
          <span
            style={{
              fontSize: 20,
              color: scoreColor,
              marginTop: 4,
              fontWeight: 600,
            }}
          >
            / 100
          </span>
        </div>
      </div>

      {scan.badges.length > 0 && (
        <div style={{ display: "flex", marginTop: 48 }}>
          {(scan.badges as string[]).slice(0, 5).map((badge, i) => (
            <div
              key={badge}
              style={{
                display: "flex",
                paddingTop: 8,
                paddingBottom: 8,
                paddingLeft: 20,
                paddingRight: 20,
                borderRadius: "999px",
                fontSize: 18,
                fontWeight: 600,
                background: "#f5f5f5",
                color: "#444",
                marginRight:
                  i < Math.min(scan.badges.length, 5) - 1 ? 12 : 0,
              }}
            >
              {badge}
            </div>
          ))}
        </div>
      )}
    </div>,
    { ...size, fonts },
  )
}
