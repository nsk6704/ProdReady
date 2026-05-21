import { NextRequest, NextResponse } from "next/server"
import { cleanupOldScans } from "@/lib/cleanup"

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const secret = process.env.CRON_SECRET

  if (secret) {
    const token = authHeader?.replace("Bearer ", "")
    if (token !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  const deleted = await cleanupOldScans()
  return NextResponse.json({ deleted })
}
