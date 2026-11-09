import type { Session, User } from '@supabase/supabase-js'
import { createContext } from 'react'

export interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  /** ข้อความ error ที่แสดงให้ผู้ใช้ได้ (เช่น ยังไม่ตั้งค่า .env, anonymous sign-in ถูกปิด) */
  error: string | null
  /** ลอง sign in ใหม่หลังเกิด error */
  retry: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
