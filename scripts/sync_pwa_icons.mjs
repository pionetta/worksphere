import fs from 'fs'
import path from 'path'

const BASE_URL = 'https://worksphere-mobile.vercel.app'
const icons = [
  'icons/icon-72x72.png',
  'icons/icon-96x96.png',
  'icons/icon-128x128.png',
  'icons/icon-144x144.png',
  'icons/icon-152x152.png',
  'icons/icon-192x192.png',
  'icons/icon-384x384.png',
  'icons/icon-512x512.png',
  'icons/maskable-192x192.png',
  'icons/maskable-512x512.png',
  'icons/apple-touch-icon.png',
  'apple-touch-icon.png',
  'favicon.svg',
]

const publicDir = path.resolve(process.cwd(), 'public')

async function syncIcons() {
  console.log('Downloading all PWA icons from reference app...')
  for (const iconPath of icons) {
    const dest = path.join(publicDir, iconPath)
    const destDir = path.dirname(dest)
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true })
    }

    try {
      const res = await fetch(`${BASE_URL}/${iconPath}`)
      if (res.ok) {
        const buffer = Buffer.from(await res.arrayBuffer())
        fs.writeFileSync(dest, buffer)
        console.log(`✅ Synced: ${iconPath} (${buffer.length} bytes)`)
      } else {
        console.log(`⚠️ Status ${res.status} for ${iconPath}`)
      }
    } catch (e) {
      console.error(`❌ Error fetching ${iconPath}:`, e.message)
    }
  }

  // Also create legacy aliases
  if (fs.existsSync(path.join(publicDir, 'icons/icon-192x192.png'))) {
    fs.copyFileSync(
      path.join(publicDir, 'icons/icon-192x192.png'),
      path.join(publicDir, 'icons/icon-192.png')
    )
  }
  if (fs.existsSync(path.join(publicDir, 'icons/icon-512x512.png'))) {
    fs.copyFileSync(
      path.join(publicDir, 'icons/icon-512x512.png'),
      path.join(publicDir, 'icons/icon-512.png')
    )
  }
  console.log('✨ All icons synced successfully!')
}

syncIcons()
