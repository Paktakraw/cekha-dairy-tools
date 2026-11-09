import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

/** false เมื่อยังไม่ได้ตั้งค่า .env — AuthProvider จะแสดงข้อความแนะนำแทนการพัง */
export const isSupabaseConfigured = Boolean(url && anonKey)

// ใช้เฉพาะ anon/publishable key เท่านั้น ห้ามใช้ service_role key ฝั่ง client
export const supabase = createClient(url ?? 'http://localhost:54321', anonKey ?? 'missing-anon-key')
