/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifestFilename: 'manifest.json',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'icons/*.png'],
      manifest: {
        name: 'WorkSphere - Absensi, Keuangan & To-Do',
        short_name: 'WorkSphere',
        description: 'Aplikasi All-in-One: Absensi Real-time, Catatan Keuangan, Manajemen Tugas.',
        lang: 'id',
        theme_color: '#6366f1',
        background_color: '#0f0f13',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-72x72.png',
            type: 'image/png',
            sizes: '72x72',
          },
          {
            src: '/icons/icon-96x96.png',
            type: 'image/png',
            sizes: '96x96',
          },
          {
            src: '/icons/icon-128x128.png',
            type: 'image/png',
            sizes: '128x128',
          },
          {
            src: '/icons/icon-144x144.png',
            type: 'image/png',
            sizes: '144x144',
          },
          {
            src: '/icons/icon-152x152.png',
            type: 'image/png',
            sizes: '152x152',
          },
          {
            src: '/icons/icon-192x192.png',
            type: 'image/png',
            sizes: '192x192',
          },
          {
            src: '/icons/icon-384x384.png',
            type: 'image/png',
            sizes: '384x384',
          },
          {
            src: '/icons/icon-512x512.png',
            type: 'image/png',
            sizes: '512x512',
            purpose: 'any',
          },
          {
            src: '/icons/maskable-192x192.png',
            type: 'image/png',
            sizes: '192x192',
            purpose: 'maskable',
          },
          {
            src: '/icons/maskable-512x512.png',
            type: 'image/png',
            sizes: '512x512',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              networkTimeoutSeconds: 10,
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    testTimeout: 10000,
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/*.d.ts', 'src/main.tsx'],
    },
  },
})
