// ต้องตรงกับ CHECK constraint ใน supabase/migrations/*_randomizer.sql
export const GROUP_NAME_MAX_LENGTH = 50
export const ITEM_LABEL_MAX_LENGTH = 100

/** Animation ตอนกดสุ่ม: สลับข้อความทุก SPIN_TICK_MS จนครบ SPIN_DURATION_MS แล้วจึงแสดงผลจริง */
export const SPIN_DURATION_MS = 1000
export const SPIN_TICK_MS = 70

export const DUPLICATE_GROUP_MESSAGE = 'มีกลุ่มชื่อนี้อยู่แล้ว กรุณาใช้ชื่ออื่น'
