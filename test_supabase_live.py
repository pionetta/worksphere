import sys
import os
import requests
import json

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

SUPABASE_URL = "https://yylxbwikopiklhtrkxux.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5bHhid2lrb3Bpa2xodHJreHV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMTkxODksImV4cCI6MjEwMjg5NTE4OX0.Hqt4vdytvLmimCIpuwONnGwpVWXX_gtO4zA_eMixukE"

headers = {
    "apikey": SUPABASE_ANON_KEY,
    "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
    "Content-Type": "application/json"
}

def test_supabase():
    print("==================================================")
    print("⚡ TESTING SUPABASE INTEGRATION & DATABASE TABLES")
    print("==================================================\n")

    # 1. Test Server Ping & Auth Health
    print("1. [Health] Checking Supabase Auth API status...")
    try:
        r = requests.get(f"{SUPABASE_URL}/auth/v1/health", headers=headers, timeout=10)
        print(f"   Status Code: {r.status_code}")
        print(f"   Response: {r.text.strip()}")
        if r.status_code in [200, 204]:
            print("   ✅ Supabase Auth Service is LIVE & HEALTHY\n")
        else:
            print("   ⚠️ Auth service returned non-200\n")
    except Exception as e:
        print(f"   ❌ Failed to connect to Supabase: {e}\n")

    # 2. Test PostgREST Schema / Tables
    tables = [
        "profiles",
        "wallets",
        "categories",
        "transactions",
        "budgets",
        "savings_goals",
        "tasks",
        "subtasks",
        "members",
        "attendance"
    ]

    print("2. [PostgREST / Database] Verifying Schema Tables...")
    for table in tables:
        try:
            url = f"{SUPABASE_URL}/rest/v1/{table}?select=count&limit=0"
            r = requests.get(url, headers=headers, timeout=10)
            if r.status_code == 200 or r.status_code == 206:
                print(f"   ✅ Table '{table}': Accessible (HTTP {r.status_code})")
            elif r.status_code == 401 or r.status_code == 403:
                print(f"   🔒 Table '{table}': Protected by RLS (Row Level Security active - HTTP {r.status_code})")
            elif r.status_code == 404:
                print(f"   ❌ Table '{table}': Not found (HTTP 404)")
            else:
                print(f"   ℹ️ Table '{table}': HTTP {r.status_code} ({r.text[:80]})")
        except Exception as e:
            print(f"   ❌ Error checking '{table}': {e}")

    print("\n==================================================")
    print("✨ SUPABASE INTEGRATION DIAGNOSTICS COMPLETED")
    print("==================================================")

if __name__ == "__main__":
    test_supabase()
