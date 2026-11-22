import type { Session } from '@supabase/supabase-js'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { isSupabaseConfigured, supabase } from '../../shared/lib/supabase'
import { AuthContext, type AuthContextValue } from './AuthContext'

const NOT_CONFIGURED_MESSAGE =
  'ยังไม่ได้ตั้งค่า Supabase: สร้างไฟล์ .env จาก .env.example แล้วใส่ VITE_SUPABASE_URL และ VITE_SUPABASE_PUBLISHABLE_KEY'

/**
 * จุดเดียวที่จัดการ session/user
 * - session เก็บใน localStorage และต่ออายุเองโดย supabase-js จึงคงอยู่จนกว่าผู้ใช้ออกจากระบบ
 * - การสมัคร/ล็อกอิน/ล็อกเอาต์ทำที่ service แล้ว session เปลี่ยนเข้ามาทาง onAuthStateChange
 * - session แบบ anonymous จากเวอร์ชันเก่าไม่นับเป็นผู้ใช้: ล้างทิ้งแล้วให้ไปหน้าเข้าสู่ระบบ
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [error, setError] = useState<string | null>(isSupabaseConfigured ? null : NOT_CONFIGURED_MESSAGE)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!isSupabaseConfigured) return

    let cancelled = false

    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      if (cancelled) return
      setSession(next?.user.is_anonymous ? null : next)
    })

    const init = async () => {
      try {
        const { data: existing, error: sessionError } = await supabase.auth.getSession()
        if (cancelled) return
        if (sessionError) throw sessionError
        if (existing.session?.user.is_anonymous) {
          await supabase.auth.signOut({ scope: 'local' })
          if (cancelled) return
          setSession(null)
        } else {
          setSession(existing.session)
        }
      } catch (cause) {
        if (cancelled) return
        console.error('[AuthProvider] ตรวจสอบเซสชัน:', cause)
        setError('ไม่สามารถตรวจสอบเซสชันได้ กรุณาลองใหม่')
      }
      setLoading(false)
    }

    void init()

    return () => {
      cancelled = true
      data.subscription.unsubscribe()
    }
  }, [attempt])

  const retry = useCallback(() => {
    setError(null)
    setLoading(true)
    setAttempt((n) => n + 1)
  }, [])

  const signOut = useCallback(async (): Promise<string | null> => {
    const { error: signOutError } = await supabase.auth.signOut({ scope: 'local' })
    if (signOutError) {
      console.error('[AuthProvider] ออกจากระบบ:', signOutError.message)
      return 'ออกจากระบบไม่สำเร็จ กรุณาลองใหม่'
    }
    return null
  }, [])

  const value = useMemo<AuthContextValue>(() => {
    const user = session?.user ?? null
    const rawUsername: unknown = user?.user_metadata?.username
    return {
      user,
      session,
      username: typeof rawUsername === 'string' ? rawUsername : null,
      loading,
      error,
      retry,
      signOut,
    }
  }, [session, loading, error, retry, signOut])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
