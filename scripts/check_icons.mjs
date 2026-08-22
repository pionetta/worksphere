import fs from 'fs'
import path from 'path'

function getPngDimensions(filePath) {
  const buf = fs.readFileSync(filePath)
  if (buf[0] !== 0x89 || buf[1] !== 0x50 || buf[2] !== 0x4e || buf[3] !== 0x47) {
    return { error: 'Not a valid PNG file' }
  }
  const width = buf.readUInt32BE(16)
  const height = buf.readUInt32BE(20)
  return { width, height, size: buf.length }
}

const root = process.cwd()
const files = [
  'public/icons/icon-192.png',
  'public/icons/icon-512.png',
  'public/apple-touch-icon.png',
  'public/manifest.json'
]

console.log('--- Checking PWA Assets ---')
for (const rel of files) {
  const full = path.join(root, rel)
  if (!fs.existsSync(full)) {
    console.log(`❌ ${rel}: NOT FOUND!`)
  } else if (rel.endsWith('.json')) {
    console.log(`✅ ${rel}: Exists (${fs.statSync(full).size} bytes)`)
    try {
      const json = JSON.parse(fs.readFileSync(full, 'utf8'))
      console.log('   name:', json.name)
      console.log('   short_name:', json.short_name)
      console.log('   start_url:', json.start_url)
      console.log('   display:', json.display)
      console.log('   icons count:', json.icons?.length)
    } catch (e) {
      console.log('   JSON Parse Error:', e.message)
    }
  } else {
    const dim = getPngDimensions(full)
    console.log(`🖼️ ${rel}:`, dim)
  }
}
