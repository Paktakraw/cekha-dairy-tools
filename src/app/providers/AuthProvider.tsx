import type { Session } from '@supabase/supabase-js'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { isSupabaseConfigured, supabase } from '../../shared/lib/supabase'
import { AuthContext, type AuthContextValue } from './AuthContext'

const NOT_CONFIGURED_MESSAGE =
  'ยังไม่ได้ตั้งค่า Supabase: สร้างไฟล์ .env จาก .env.example แล้วใส่ VITE_SUPABASE_URL และ VITE_SUPABASE_PUBLISHABLE_KEY'

/**
 * จุดเดียวที่จัดการ session/user
 * V1: sign in แบบ anonymous อัตโนมัติ — อนาคตเปลี่ยนเป็น Email/OAuth ได้โดยแก้ที่ไฟล์นี้
 * (ผูก anonymous user เดิมกับบัญชีจริงด้วย supabase.auth.updateUser / linkIdentity)
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
      if (!cancelled) setSession(next)
    })

    const init = async () => {
      const { data: existing, error: sessionError } = await supabase.auth.getSession()
      if (cancelled) return
      if (sessionError) {
        setError('ไม่สามารถตรวจสอบเซสชันได้ กรุณาลองใหม่')
        setLoading(false)
        return
      }
      if (existing.session) {
        setSession(existing.session)
        setLoading(false)
        return
      }
      const { data: created, error: signInError } = await supabase.auth.signInAnonymously()
      if (cancelled) return
      if (signInError) {
        setError('เข้าสู่ระบบแบบไม่ระบุตัวตนไม่สำเร็จ ตรวจสอบว่าเปิด “Anonymous Sign-ins” ในหน้า Authentication ของ Supabase แล้ว')
      } else {
        setSession(created.session)
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

  const value = useMemo<AuthContextValue>(
    () => ({ user: session?.user ?? null, session, loading, error, retry }),
    [session, loading, error, retry],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
