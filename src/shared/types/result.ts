/** รูปแบบผลลัพธ์ที่ Service ทุกตัวคืนให้ Hook (ไม่ throw) */
export type ServiceResult<T> = { data: T; error: null } | { data: null; error: string }
