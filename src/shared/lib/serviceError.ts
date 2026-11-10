import type { ServiceResult } from '../types/result'

/** รหัส error ของ PostgreSQL ที่ Service ต้องแปลเป็นข้อความที่ผู้ใช้เข้าใจ */
export const PG_UNIQUE_VIOLATION = '23505'
export const PG_FOREIGN_KEY_VIOLATION = '23503'

interface ErrorCause {
  message: string
  code?: string
}

/**
 * สร้างผลลัพธ์ error มาตรฐานของ Service (ใช้ร่วมกันทุกฟีเจอร์)
 * - ถ้ารหัส error อยู่ใน knownMessages จะคืนข้อความนั้น (เช่น ชื่อซ้ำ)
 * - ไม่เช่นนั้นบันทึกรายละเอียดลง console และคืนข้อความทั่วไปที่ไม่เปิดเผยรายละเอียดภายใน
 */
export function serviceFail<T>(
  scope: string,
  action: string,
  cause: ErrorCause,
  knownMessages: Partial<Record<string, string>> = {},
): ServiceResult<T> {
  const known = cause.code ? knownMessages[cause.code] : undefined
  if (known) return { data: null, error: known }
  console.error(`[${scope}] ${action}:`, cause.message)
  return { data: null, error: `${action}ไม่สำเร็จ กรุณาลองใหม่` }
}
