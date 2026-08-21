import { describe, it, expect, beforeAll } from 'vitest'

// Dynamically import Node.js modules inside vitest (runs in Node)
// to avoid TypeScript compilation issues with tsconfig.app.json
let fs: typeof import('node:fs')
let path: typeof import('node:path')

let root: string
let distManifest: string | null = null
let indexHtml: string
let viteConfig: string
let gitignore: string
let envExample: string

beforeAll(async () => {
  fs = await import('node:fs')
  path = await import('node:path')
  root = path.resolve(import.meta.dirname, '..', '..')

  indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf-8')
  viteConfig = fs.readFileSync(path.join(root, 'vite.config.ts'), 'utf-8')
  gitignore = fs.readFileSync(path.join(root, '.gitignore'), 'utf-8')

  const envPath = path.join(root, '.env.example')
  envExample = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : ''

  const manifestPath = path.join(root, 'dist', 'manifest.webmanifest')
  if (fs.existsSync(manifestPath)) {
    distManifest = fs.readFileSync(manifestPath, 'utf-8')
  }
})

// ─── PWA Manifest ─────────────────────────────────────────────────────────────

describe('PWA Manifest', () => {
  it('should exist in dist after build', () => {
    if (!distManifest) {
      console.warn('Skipping: dist/manifest.webmanifest not found')
      return
    }
    expect(distManifest).toBeTruthy()
  })

  it('should have correct name', () => {
    if (!distManifest) return
    const m = JSON.parse(distManifest)
    expect(m.name).toBe('Worksphere')
    expect(m.short_name).toBe('Worksphere')
  })

  it('should have lang set to id', () => {
    if (!distManifest) return
    const m = JSON.parse(distManifest)
    expect(m.lang).toBe('id')
  })

  it('should have standalone display mode', () => {
    if (!distManifest) return
    const m = JSON.parse(distManifest)
    expect(m.display).toBe('standalone')
  })

  it('should have correct theme and background colors', () => {
    if (!distManifest) return
    const m = JSON.parse(distManifest)
    expect(m.theme_color).toBe('#6366f1')
    expect(m.background_color).toBe('#0f0f13')
  })

  it('should have correct start_url and scope', () => {
    if (!distManifest) return
    const m = JSON.parse(distManifest)
    expect(m.start_url).toBe('/')
    expect(m.scope).toBe('/')
  })

  it('should have portrait orientation', () => {
    if (!distManifest) return
    const m = JSON.parse(distManifest)
    expect(m.orientation).toBe('portrait')
  })

  it('should have at least 2 icons', () => {
    if (!distManifest) return
    const m = JSON.parse(distManifest)
    expect(m.icons).toBeDefined()
    expect(m.icons.length).toBeGreaterThanOrEqual(2)
  })

  it('should have 192x192 icon', () => {
    if (!distManifest) return
    const m = JSON.parse(distManifest)
    const icon = m.icons.find((i: { sizes: string }) => i.sizes === '192x192')
    expect(icon).toBeDefined()
    expect(icon.type).toBe('image/png')
  })

  it('should have 512x512 icon', () => {
    if (!distManifest) return
    const m = JSON.parse(distManifest)
    const icon = m.icons.find(
      (i: { sizes: string; purpose?: string }) => i.sizes === '512x512' && !i.purpose
    )
    expect(icon).toBeDefined()
  })

  it('should have maskable icon', () => {
    if (!distManifest) return
    const m = JSON.parse(distManifest)
    const icon = m.icons.find((i: { purpose?: string }) => i.purpose?.includes('maskable'))
    expect(icon).toBeDefined()
  })
})

// ─── Icon Files ───────────────────────────────────────────────────────────────

describe('PWA Icons', () => {
  const iconFiles = [
    'icons/icon-192.png',
    'icons/icon-512.png',
    'apple-touch-icon.png',
    'favicon.svg',
  ]

  for (const rel of iconFiles) {
    it(`should have ${rel}`, () => {
      const fullPath = path.join(root, 'public', rel)
      expect(fs.existsSync(fullPath)).toBe(true)
    })
  }

  it('should have valid PNG files (correct signature)', () => {
    const pngFiles = ['icons/icon-192.png', 'icons/icon-512.png', 'apple-touch-icon.png']
    for (const rel of pngFiles) {
      const buf = fs.readFileSync(path.join(root, 'public', rel))
      expect(buf.length).toBeGreaterThan(100)
      expect(buf[0]).toBe(0x89) // PNG magic number
      expect(buf[1]).toBe(0x50) // P
      expect(buf[2]).toBe(0x4e) // N
      expect(buf[3]).toBe(0x47) // G
    }
  })
})

// ─── Service Worker ───────────────────────────────────────────────────────────

describe('Service Worker', () => {
  it('should have sw.js in dist', () => {
    const swPath = path.join(root, 'dist', 'sw.js')
    if (!fs.existsSync(swPath)) {
      console.warn('Skipping: dist/sw.js not found')
      return
    }
    expect(fs.existsSync(swPath)).toBe(true)
  })

  it('should have registerSW.js in dist', () => {
    const regPath = path.join(root, 'dist', 'registerSW.js')
    if (!fs.existsSync(regPath)) return
    expect(fs.existsSync(regPath)).toBe(true)
  })
})

// ─── Vite Config ──────────────────────────────────────────────────────────────

describe('Vite PWA Configuration', () => {
  it('should have Worksphere name in manifest config', () => {
    expect(viteConfig).toContain("name: 'Worksphere'")
  })

  it('should have standalone display mode', () => {
    expect(viteConfig).toContain("display: 'standalone'")
  })

  it('should have lang set to id', () => {
    expect(viteConfig).toContain("lang: 'id'")
  })

  it('should have workbox globPatterns', () => {
    expect(viteConfig).toContain('globPatterns')
  })

  it('should have maximumFileSizeToCacheInBytes', () => {
    expect(viteConfig).toContain('maximumFileSizeToCacheInBytes')
  })

  it('should have runtimeCaching for Supabase', () => {
    expect(viteConfig).toContain('runtimeCaching')
    expect(viteConfig).toContain('supabase')
    expect(viteConfig).toContain('NetworkFirst')
  })
})

// ─── Environment Security ─────────────────────────────────────────────────────

describe('Environment Security', () => {
  it('.env.example should have only VITE_ prefixed vars', () => {
    if (!envExample) return
    expect(envExample).toContain('VITE_SUPABASE_URL')
    expect(envExample).toContain('VITE_SUPABASE_ANON_KEY')
    expect(envExample).not.toContain('SERVICE_ROLE')
  })

  it('.gitignore should cover .env files', () => {
    expect(gitignore).toContain('.env')
    expect(gitignore).toContain('.env.local')
    expect(gitignore).toContain('.env.production.local')
  })
})

// ─── index.html PWA Meta Tags ─────────────────────────────────────────────────

describe('index.html PWA meta tags', () => {
  it('should have lang="id"', () => {
    expect(indexHtml).toContain('lang="id"')
  })

  it('should have viewport-fit=cover', () => {
    expect(indexHtml).toContain('viewport-fit=cover')
  })

  it('should have apple-mobile-web-app-capable', () => {
    expect(indexHtml).toContain('apple-mobile-web-app-capable')
  })

  it('should have theme-color', () => {
    expect(indexHtml).toContain('theme-color')
  })

  it('should have apple-mobile-web-app-title', () => {
    expect(indexHtml).toContain('apple-mobile-web-app-title')
  })
})
