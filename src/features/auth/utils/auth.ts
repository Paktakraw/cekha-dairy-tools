import type { LoginErrors, LoginInput, RegisterErrors, RegisterInput, UniqueField } from '../types/auth'

export const USERNAME_MIN = 3
export const USERNAME_MAX = 30
export const PASSWORD_MIN = 8
/** bcrypt ใช้ได้ไม่เกิน 72 **ไบต์** (UTF-8) — ภาษาไทยตัวละ 3 ไบต์ จึงใส่ได้ประมาณ 24 ตัวอักษร */
export const PASSWORD_MAX_BYTES = 72
export const NAME_MAX = 100
export const EMAIL_MAX = 254

const USERNAME_PATTERN = /^[a-z0-9_.]+$/
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
const PHONE_PATTERN = /^0\d{9}$/

/** ความยาวเป็นไบต์ UTF-8 (ใช้ตรวจรหัสผ่านให้ตรงกับข้อจำกัดของ bcrypt) */
export const utf8ByteLength = (value: string): number => new TextEncoder().encode(value).length

export const normalizeUsername = (value: string): string => value.trim().toLowerCase()

export const normalizeEmail = (value: string): string => value.trim().toLowerCase()

/** เก็บเฉพาะตัวเลข (ตัดช่องว่าง ขีด วงเล็บ) และแปลงรหัสประเทศ +66 / 66 เป็น 0 */
export function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (digits.startsWith('66') && digits.length === 11) return `0${digits.slice(2)}`
  return digits
}

/** อีเมลสังเคราะห์ที่ใช้ล็อกอินกับ Supabase Auth แทน username (โดเมนมาจาก `config.ts`) */
export const toAuthEmail = (username: string, domain: string): string => `${normalizeUsername(username)}@${domain}`

function validateUsername(value: string): string | undefined {
  const username = normalizeUsername(value)
  if (!username) return 'กรุณากรอกชื่อผู้ใช้'
  if (username.length < USERNAME_MIN || username.length > USERNAME_MAX) {
    return `ชื่อผู้ใช้ต้องยาว ${USERNAME_MIN}–${USERNAME_MAX} ตัวอักษร`
  }
  if (!USERNAME_PATTERN.test(username)) return 'ใช้ได้เฉพาะ a-z, 0-9, _ และ . เท่านั้น'
  return undefined
}

export function validateRegister(input: RegisterInput): RegisterErrors {
  const errors: RegisterErrors = {}

  const firstName = input.firstName.trim()
  if (!firstName) errors.firstName = 'กรุณากรอกชื่อจริง'
  else if (firstName.length > NAME_MAX) errors.firstName = `ชื่อจริงต้องไม่เกิน ${NAME_MAX} ตัวอักษร`

  const lastName = input.lastName.trim()
  if (!lastName) errors.lastName = 'กรุณากรอกนามสกุล'
  else if (lastName.length > NAME_MAX) errors.lastName = `นามสกุลต้องไม่เกิน ${NAME_MAX} ตัวอักษร`

  const usernameError = validateUsername(input.username)
  if (usernameError) errors.username = usernameError

  const email = normalizeEmail(input.email)
  if (!email) errors.email = 'กรุณากรอกอีเมล'
  else if (email.length > EMAIL_MAX || !EMAIL_PATTERN.test(email)) errors.email = 'รูปแบบอีเมลไม่ถูกต้อง'

  const phone = normalizePhone(input.phone)
  if (!phone) errors.phone = 'กรุณากรอกเบอร์โทร'
  else if (!PHONE_PATTERN.test(phone)) errors.phone = 'เบอร์โทรต้องเป็นตัวเลข 10 หลัก เช่น 0812345678'

  if (!input.password) errors.password = 'กรุณากรอกรหัสผ่าน'
  else if (input.password.length < PASSWORD_MIN) errors.password = `รหัสผ่านต้องยาวอย่างน้อย ${PASSWORD_MIN} ตัวอักษร`
  else if (utf8ByteLength(input.password) > PASSWORD_MAX_BYTES) {
    errors.password = `รหัสผ่านยาวเกินไป (ไม่เกิน ${PASSWORD_MAX_BYTES} ไบต์ ภาษาอังกฤษ ${PASSWORD_MAX_BYTES} ตัว หรือภาษาไทยประมาณ ${PASSWORD_MAX_BYTES / 3} ตัว)`
  }

  if (!errors.password && input.confirmPassword !== input.password) {
    errors.confirmPassword = 'รหัสผ่านยืนยันไม่ตรงกัน'
  }

  return errors
}

/** ล็อกอินตรวจแค่ว่ากรอกครบ (ไม่บอกรายละเอียดรูปแบบ เพื่อไม่เปิดเผยกฎของระบบเกินจำเป็น) */
export function validateLogin(input: LoginInput): LoginErrors {
  const errors: LoginErrors = {}
  if (!input.username.trim()) errors.username = 'กรุณากรอกชื่อผู้ใช้'
  if (!input.password) errors.password = 'กรุณากรอกรหัสผ่าน'
  return errors
}

const TAKEN_MESSAGES: Record<UniqueField, string> = {
  username: 'ชื่อผู้ใช้นี้ถูกใช้แล้ว',
  email: 'อีเมลนี้ถูกใช้แล้ว',
  phone: 'เบอร์โทรนี้ถูกใช้แล้ว',
}

/** แปลงรายชื่อฟิลด์ที่ซ้ำ (จาก RPC) เป็นข้อความ error ใต้ช่องที่ตรงกัน */
export function takenFieldsToErrors(fields: readonly string[]): RegisterErrors {
  const errors: RegisterErrors = {}
  for (const field of fields) {
    if (field === 'username' || field === 'email' || field === 'phone') errors[field] = TAKEN_MESSAGES[field]
  }
  return errors
}
