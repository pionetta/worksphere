// Simple PNG icon generator using pure Node.js (no dependencies)
// Creates Worksphere branding icons for PWA manifest

import { writeFileSync } from 'fs'
import { join } from 'path'

const PUBLIC_DIR = join(import.meta.dirname, '..', 'public')

// Minimal PNG encoder — creates a valid PNG with a solid color
function createPNG(size, bgColor, fgColor, borderRadius) {
  const width = size
  const height = size

  // Create pixel data (RGBA)
  const pixels = new Uint8Array(width * height * 4)

  const bg = hexToRGB(bgColor)
  const fg = hexToRGB(fgColor)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4
      const isRounded = isRoundedCorner(x, y, width, height, borderRadius)

      if (isRounded) {
        // Transparent background
        pixels[idx] = 0
        pixels[idx + 1] = 0
        pixels[idx + 2] = 0
        pixels[idx + 3] = 0
      } else {
  // Check if we're in the "W" letter area
  const inW = isInWShape(x, y, width, height)

        if (inW) {
          pixels[idx] = fg.r
          pixels[idx + 1] = fg.g
          pixels[idx + 2] = fg.b
          pixels[idx + 3] = 255
        } else {
          pixels[idx] = bg.r
          pixels[idx + 1] = bg.g
          pixels[idx + 2] = bg.b
          pixels[idx + 3] = 255
        }
      }
    }
  }

  return encodePNG(width, height, pixels)
}

function hexToRGB(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}

function isRoundedCorner(x, y, width, height, radius) {
  const r = radius
  // Top-left
  if (x < r && y < r) {
    const dx = r - x
    const dy = r - y
    return dx * dx + dy * dy > r * r
  }
  // Top-right
  if (x >= width - r && y < r) {
    const dx = x - (width - r)
    const dy = r - y
    return dx * dx + dy * dy > r * r
  }
  // Bottom-left
  if (x < r && y >= height - r) {
    const dx = r - x
    const dy = y - (height - r)
    return dx * dx + dy * dy > r * r
  }
  // Bottom-right
  if (x >= width - r && y >= height - r) {
    const dx = x - (width - r)
    const dy = y - (height - r)
    return dx * dx + dy * dy > r * r
  }
  return false
}

function isInWShape(x, y, width, height) {
  // Draw a "W" in the center
  const cx = width / 2
  const cy = height / 2
  const w = width * 0.4
  const h = height * 0.35
  const stroke = width * 0.06

  // Normalize coordinates relative to center
  const nx = (x - cx) / w
  const ny = (y - cy) / h

  // "W" shape: 4 diagonal strokes
  // Left stroke: from (-0.8, -0.5) to (-0.3, 0.5)
  // Center-left stroke: from (-0.3, 0.5) to (0, -0.3)
  // Center-right stroke: from (0, -0.3) to (0.3, 0.5)
  // Right stroke: from (0.3, 0.5) to (0.8, -0.5)

  const sw = stroke / w

  // Check each stroke
  return (
    pointToLineDistance(nx, ny, -0.8, -0.5, -0.3, 0.5) < sw ||
    pointToLineDistance(nx, ny, -0.3, 0.5, 0, -0.3) < sw ||
    pointToLineDistance(nx, ny, 0, -0.3, 0.3, 0.5) < sw ||
    pointToLineDistance(nx, ny, 0.3, 0.5, 0.8, -0.5) < sw
  )
}

function pointToLineDistance(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1
  const dy = y2 - y1
  const len2 = dx * dx + dy * dy
  if (len2 === 0) return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2)

  let t = ((px - x1) * dx + (py - y1) * dy) / len2
  t = Math.max(0, Math.min(1, t))

  const projX = x1 + t * dx
  const projY = y1 + t * dy
  return Math.sqrt((px - projX) ** 2 + (py - projY) ** 2)
}

// Minimal PNG encoder
function encodePNG(width, height, pixels) {
  const signature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])

  // IHDR chunk
  const ihdrData = Buffer.alloc(13)
  ihdrData.writeUInt32BE(width, 0)
  ihdrData.writeUInt32BE(height, 4)
  ihdrData[8] = 8 // bit depth
  ihdrData[9] = 6 // color type (RGBA)
  ihdrData[10] = 0 // compression
  ihdrData[11] = 0 // filter
  ihdrData[12] = 0 // interlace
  const ihdr = createChunk('IHDR', ihdrData)

  // IDAT chunk - use raw deflate (no compression for simplicity)
  const rawData = Buffer.alloc(height * (1 + width * 4))
  for (let y = 0; y < height; y++) {
    rawData[y * (1 + width * 4)] = 0 // filter: none
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * 4
      const dstIdx = y * (1 + width * 4) + 1 + x * 4
      rawData[dstIdx] = pixels[srcIdx]
      rawData[dstIdx + 1] = pixels[srcIdx + 1]
      rawData[dstIdx + 2] = pixels[srcIdx + 2]
      rawData[dstIdx + 3] = pixels[srcIdx + 3]
    }
  }
  const compressed = deflateRaw(rawData)
  const idat = createChunk('IDAT', compressed)

  // IEND chunk
  const iend = createChunk('IEND', Buffer.alloc(0))

  return Buffer.concat([signature, ihdr, idat, iend])
}

function createChunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length, 0)

  const typeBuffer = Buffer.from(type, 'ascii')
  const crcData = Buffer.concat([typeBuffer, data])

  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(crcData), 0)

  return Buffer.concat([length, typeBuffer, data, crc])
}

// CRC32 implementation
const crcTable = new Uint32Array(256)
for (let n = 0; n < 256; n++) {
  let c = n
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  }
  crcTable[n] = c
}

function crc32(buf) {
  let crc = 0xffffffff
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

// Simple raw deflate (uncompressed blocks)
function deflateRaw(data) {
  const MAX_BLOCK = 65535
  const blocks = []

  let pos = 0
  while (pos < data.length) {
    const remaining = data.length - pos
    const blockLen = Math.min(remaining, MAX_BLOCK)
    const isLast = pos + blockLen >= data.length

    // Uncompressed block: BFINAL(1 bit) + BTYPE(2 bits) = 0x00 for last, 0x01 for non-last
    const header = Buffer.alloc(5)
    header[0] = isLast ? 0x01 : 0x00
    header.writeUInt16LE(blockLen, 1)
    header.writeUInt16LE(blockLen ^ 0xffff, 3)

    blocks.push(header, data.subarray(pos, pos + blockLen))
    pos += blockLen
  }

  return Buffer.concat(blocks)
}

// Generate icons
const ICONS = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
]

const BG_COLOR = '#6366f1' // indigo-500
const FG_COLOR = '#ffffff' // white
const BORDER_RADIUS_RATIO = 0.22 // ~22% for iOS-style rounded square

console.log('Generating PWA icons...')

for (const icon of ICONS) {
  const borderRadius = Math.round(icon.size * BORDER_RADIUS_RATIO)
  const png = createPNG(icon.size, BG_COLOR, FG_COLOR, borderRadius)
  const path = join(PUBLIC_DIR, icon.name)
  writeFileSync(path, png)
  console.log(`  ✓ ${icon.name} (${icon.size}x${icon.size})`)
}

// Also copy favicon to dist if needed
console.log('\nDone! Icons generated in public/')
