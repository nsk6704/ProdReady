import { readFile } from "node:fs/promises"
import path from "node:path"

const FONTS_DIR = path.join(process.cwd(), "public/fonts")

const fontCache: Record<string, ArrayBuffer> = {}

async function loadFont(weight: number): Promise<ArrayBuffer> {
  const key = `SpaceGrotesk-${weight}`
  if (fontCache[key]) return fontCache[key]
  const data = await readFile(path.join(FONTS_DIR, `SpaceGrotesk-${weight}.ttf`))
  fontCache[key] = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer
  return fontCache[key]
}

export async function getSpaceGroteskFonts() {
  return [
    { name: "Space Grotesk", data: await loadFont(400), weight: 400 as const, style: "normal" as const },
    { name: "Space Grotesk", data: await loadFont(600), weight: 600 as const, style: "normal" as const },
    { name: "Space Grotesk", data: await loadFont(700), weight: 700 as const, style: "normal" as const },
  ]
}
