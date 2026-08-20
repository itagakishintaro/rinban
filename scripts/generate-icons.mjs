// scripts/icon.svg からPWAアイコン一式を public/ に生成する
import sharp from 'sharp'
import { readFileSync, mkdirSync } from 'node:fs'

const svg = readFileSync(new URL('./icon.svg', import.meta.url))
mkdirSync('public', { recursive: true })

const targets = [
  { file: 'public/pwa-192x192.png', size: 192 },
  { file: 'public/pwa-512x512.png', size: 512 },
  { file: 'public/apple-touch-icon.png', size: 180 },
]
for (const { file, size } of targets) {
  await sharp(svg).resize(size, size).png().toFile(file)
}

// maskable: セーフゾーン確保のため80%に縮小して余白を地色で埋める
const inner = await sharp(svg).resize(410, 410).png().toBuffer()
await sharp({
  create: { width: 512, height: 512, channels: 4, background: '#2f9461' },
})
  .composite([{ input: inner, gravity: 'center' }])
  .png()
  .toFile('public/pwa-maskable-512x512.png')

console.log('icons generated')
