import { serviceFail } from '../../../shared/lib/serviceError'
import { supabase } from '../../../shared/lib/supabase'
import type { ServiceResult } from '../../../shared/types/result'
import { authEmailDomain } from '../config'
import type { LoginInput, RegisterInput } from '../types/auth'
import { normalizeEmail, normalizePhone, normalizeUsername, toAuthEmail } from '../utils/auth'

/** error.code ของ Supabase Auth ที่แปลเป็นข้อความที่ผู้ใช้เข้าใจ */
const KNOWN: Record<string, string> = {
  invalid_credentials: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
  user_already_exists: 'ชื่อผู้ใช้นี้ถูกใช้แล้ว',
  // trigger สร้างโปรไฟล์ล้มเหลว (อีเมล/เบอร์ซ้ำที่หลุดจากด่านตรวจก่อนสมัคร เพราะมีคนสมัครพร้อมกัน)
  unexpected_failure: 'สมัครไม่สำเร็จ อีเมลหรือเบอร์โทรนี้อาจถูกใช้แล้ว กรุณาตรวจสอบแล้วลองใหม่',
  weak_password: 'รหัสผ่านง่ายเกินไป กรุณาเปลี่ยนรหัสผ่าน',
  over_request_rate_limit: 'ลองหลายครั้งเกินไป กรุณารอสักครู่แล้วลองใหม่',
  over_email_send_rate_limit: 'ลองหลายครั้งเกินไป กรุณารอสักครู่แล้วลองใหม่',
}

const CONFIRM_EMAIL_ON_MESSAGE =
  'สมัครสำเร็จแต่ยังเข้าสู่ระบบไม่ได้: ผู้ดูแลระบบต้องปิด “Confirm email” ในหน้า Authentication ของ Supabase'

const NOT_CONFIGURED_MESSAGE =
  'ยังไม่ได้ตั้งค่าโดเมนอีเมลสำหรับเข้าสู่ระบบ: ใส่ VITE_AUTH_EMAIL_DOMAIN ในไฟล์ .env แล้วรีสตาร์ท'

function fail<T>(action: string, cause: { message: string; code?: string }): ServiceResult<T> {
  return serviceFail<T>('authService', action, cause, KNOWN)
}

export const authService = {
  /** ฟิลด์ที่ถูกใช้แล้ว (username / email / phone) — ว่างเมื่อสมัครได้ */
  async checkAvailability(input: Pick<RegisterInput, 'username' | 'email' | 'phone'>): Promise<ServiceResult<string[]>> {
    const { data, error } = await supabase.rpc('check_register_available', {
      p_username: normalizeUsername(input.username),
      p_email: normalizeEmail(input.email),
      p_phone: normalizePhone(input.phone),
    })
    if (error) return fail('ตรวจสอบข้อมูลสมัคร', error)
    // rpc ของ client ที่ไม่มี generated types คืนค่า any จึงตรวจชนิดเองก่อนใช้
    const taken: unknown = data
    return { data: Array.isArray(taken) ? taken.filter((v): v is string => typeof v === 'string') : [], error: null }
  },

  /** สมัครสมาชิก: สำเร็จแล้ว Supabase ล็อกอินให้ทันที (AuthProvider รับ session ผ่าน onAuthStateChange) */
  async signUp(input: RegisterInput): Promise<ServiceResult<null>> {
    if (!authEmailDomain) return { data: null, error: NOT_CONFIGURED_MESSAGE }
    const { data, error } = await supabase.auth.signUp({
      email: toAuthEmail(input.username, authEmailDomain),
      password: input.password,
      options: {
        data: {
          username: normalizeUsername(input.username),
          first_name: input.firstName.trim(),
          last_name: input.lastName.trim(),
          email: normalizeEmail(input.email),
          phone: normalizePhone(input.phone),
        },
      },
    })
    if (error) return fail('สมัครสมาชิก', error)
    if (!data.session) return { data: null, error: CONFIRM_EMAIL_ON_MESSAGE }
    return { data: null, error: null }
  },

  async signIn(input: LoginInput): Promise<ServiceResult<null>> {
    if (!authEmailDomain) return { data: null, error: NOT_CONFIGURED_MESSAGE }
    const { error } = await supabase.auth.signInWithPassword({
      email: toAuthEmail(input.username, authEmailDomain),
      password: input.password,
    })
    if (error) return fail('เข้าสู่ระบบ', error)
    return { data: null, error: null }
  },
}
