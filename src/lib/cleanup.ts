import { prisma } from "./prisma"

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000

export async function cleanupOldScans() {
  const cutoff = new Date(Date.now() - TWENTY_FOUR_HOURS)
  const { count } = await prisma.scan.deleteMany({
    where: { createdAt: { lt: cutoff } },
  })
  return count
}
