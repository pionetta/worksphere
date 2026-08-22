import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from './supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  isAuthenticated: boolean
}

export const DEMO_STORAGE_KEY = 'worksphere_local_user'

export const DEMO_USER: User = {
  id: '00000000-0000-4000-8000-000000000001',
  app_metadata: { provider: 'email' },
  user_metadata: { full_name: 'Pengguna Demo' },
  aud: 'authenticated',
  created_at: '2026-08-22T00:00:00.000Z',
  email: 'demo@worksphere.local',
  role: 'authenticated',
  updated_at: '2026-08-22T00:00:00.000Z',
}

export interface SignUpOptions {
  username?: string
  redirectTo?: string
}

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (
    email: string,
    password: string,
    options?: SignUpOptions
  ) => Promise<{ data: any | null; error: AuthError | null }>
  signInDemo: () => Promise<void>
  signOut: () => Promise<void>
}

// ─── Auth Functions (standalone, testable) ─────────────────────────────────────

export async function signIn(
  email: string,
  password: string
): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  return { error }
}

export async function signUp(
  email: string,
  password: string,
  options?: SignUpOptions
): Promise<{ data: any | null; error: AuthError | null }> {
  const redirectUrl =
    options?.redirectTo ??
    (typeof window !== 'undefined' && window.location?.origin
      ? `${window.location.origin}/app`
      : undefined)

  const signUpParams: {
    email: string
    password: string
    options?: {
      data?: { username?: string; full_name?: string }
      emailRedirectTo?: string
    }
  } = {
    email,
    password,
  }

  if (options?.username || redirectUrl) {
    signUpParams.options = {
      ...(options?.username
        ? { data: { username: options.username.trim(), full_name: options.username.trim() } }
        : {}),
      ...(redirectUrl ? { emailRedirectTo: redirectUrl } : {}),
    }
  }

  const { data, error } = await supabase.auth.signUp(signUpParams)
  return { data, error }
}

export async function signOut(): Promise<void> {
  localStorage.removeItem(DEMO_STORAGE_KEY)
  await supabase.auth.signOut()
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const localUserJson = localStorage.getItem(DEMO_STORAGE_KEY)
    if (localUserJson) {
      try {
        return JSON.parse(localUserJson)
      } catch {
        localStorage.removeItem(DEMO_STORAGE_KEY)
      }
    }
    return null
  })
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const localUserJson = localStorage.getItem(DEMO_STORAGE_KEY)
    if (localUserJson) {
      try {
        const parsed = JSON.parse(localUserJson)
        setUser(parsed)
        setLoading(false)
        return
      } catch {
        localStorage.removeItem(DEMO_STORAGE_KEY)
      }
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!localStorage.getItem(DEMO_STORAGE_KEY)) {
        setSession(session)
        setUser(session?.user ?? null)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!localStorage.getItem(DEMO_STORAGE_KEY)) {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInDemo = async () => {
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(DEMO_USER))
    setUser(DEMO_USER)
    setSession(null)
  }

  const handleSignOut = async () => {
    localStorage.removeItem(DEMO_STORAGE_KEY)
    setUser(null)
    setSession(null)
    await supabase.auth.signOut()
  }

  const value: AuthContextValue = {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signInDemo,
    signOut: handleSignOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth harus digunakan dalam AuthProvider')
  }
  return context
}
