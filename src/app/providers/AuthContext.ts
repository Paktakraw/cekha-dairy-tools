import type { Session, User } from '@supabase/supabase-js'
import { createContext } from 'react'

export interface AuthContextValue {
  user: User | null
  session: Session | null
  /** ชื่อในระบบ = username (จาก metadata ตอนสมัคร) */
  username: string | null
  loading: boolean
  /** ข้อความ error ที่แสดงให้ผู้ใช้ได้ (เช่น ยังไม่ตั้งค่า .env, ตรวจ session ไม่ได้) */
  error: string | null
  /** ลองตรวจ session ใหม่หลังเกิด error */
  retry: () => void
  /** ออกจากระบบ (เฉพาะเครื่องนี้) — คืนข้อความ error หรือ null เมื่อสำเร็จ */
  signOut: () => Promise<string | null>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
