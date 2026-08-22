import fs from 'fs'
import path from 'path'

const envPath = path.resolve(process.cwd(), '.env')
let envContent = ''
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf-8')
}

function getEnvVar(key) {
  const match = envContent.match(new RegExp(`^${key}=(.*)$`, 'm'))
  return match ? match[1].trim() : process.env[key] || ''
}

const SUPABASE_URL = getEnvVar('VITE_SUPABASE_URL')
const SUPABASE_ANON_KEY = getEnvVar('VITE_SUPABASE_ANON_KEY')

console.log('====================================================')
console.log('🔍 WORKSPHERE — PEMERIKSAAN INTEGRASI SUPABASE')
console.log('====================================================\n')

console.log(`📌 Supabase URL: ${SUPABASE_URL || '❌ (TIDAK DITEMUKAN)'}`)
console.log(`📌 Anon Key: ${SUPABASE_ANON_KEY ? '✅ (Terkonfigurasi)' : '❌ (TIDAK DITEMUKAN)'}\n`)

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Kredensial Supabase belum lengkap di .env!')
  process.exit(1)
}

const headers = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
}

async function runCheck() {
  // 1. Check Auth Health
  console.log('1. [Auth Service] Memeriksa koneksi Auth Supabase...')
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/health`, { headers })
    console.log(`   HTTP Status: ${res.status}`)
    if (res.ok) {
      console.log('   ✅ Layanan Auth Supabase ONLINE dan AKTIF!\n')
    } else {
      console.log(`   ⚠️ Respon non-200: ${await res.text()}\n`)
    }
  } catch (err) {
    console.error(`   ❌ Gagal menghubungi Auth API: ${err.message}\n`)
  }

  // 2. Check Database Tables via PostgREST
  const tables = [
    'profiles',
    'wallets',
    'categories',
    'transactions',
    'budgets',
    'savings_goals',
    'debts',
    'tasks',
    'subtasks',
    'members',
    'attendance',
    'sync_queue',
  ]

  console.log('2. [PostgREST / Database] Memeriksa tabel-tabel di Supabase...')
  for (const table of tables) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=count&limit=0`, { credentials: 'omit', headers })
      if (res.status === 200 || res.status === 206) {
        console.log(`   ✅ Tabel '${table}': Tersedia & Dapat diakses (HTTP ${res.status})`)
      } else if (res.status === 401 || res.status === 403) {
        console.log(`   🔒 Tabel '${table}': Terproteksi RLS (Row Level Security aktif - HTTP ${res.status})`)
      } else if (res.status === 404) {
        console.log(`   ⚠️ Tabel '${table}': Belum dibuat / 404 (Perlu jalankan migration SQL)`)
      } else {
        const text = await res.text()
        console.log(`   ℹ️ Tabel '${table}': HTTP ${res.status} (${text.slice(0, 100)})`)
      }
    } catch (err) {
      console.error(`   ❌ Error memeriksa '${table}': ${err.message}`)
    }
  }

  console.log('\n====================================================')
  console.log('✨ DIAGNOSTIK INTEGRASI SUPABASE SELESAI')
  console.log('====================================================')
}

runCheck()
