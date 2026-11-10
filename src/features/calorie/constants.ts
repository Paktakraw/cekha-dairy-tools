import type { ActivityLevel, MealType } from './types/calorie'

// ต้องตรงกับ CHECK constraint ใน supabase/migrations/*_calorie.sql
export const FOOD_NAME_MAX_LENGTH = 100
export const FOOD_UNIT_MAX_LENGTH = 20
export const KCAL_MAX = 10_000
export const QUANTITY_MAX = 100
export const AGE_MIN = 10
export const AGE_MAX = 100
export const WEIGHT_MIN = 20
export const WEIGHT_MAX = 300
export const HEIGHT_MIN = 100
export const HEIGHT_MAX = 250

export const PAGE_SIZE = 10

export const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']

export const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'มื้อเช้า',
  lunch: 'มื้อกลางวัน',
  dinner: 'มื้อเย็น',
  snack: 'ของว่าง',
}

export const ACTIVITY_LEVEL_ORDER: ActivityLevel[] = ['sedentary', 'light', 'moderate', 'active', 'very_active']

/** ตัวคูณมาตรฐานสำหรับคำนวณ TDEE = BMR × ตัวคูณ */
export const ACTIVITY_LEVELS: Record<ActivityLevel, { label: string; multiplier: number }> = {
  sedentary: { label: 'นั่งทำงานเป็นหลัก แทบไม่ออกกำลังกาย', multiplier: 1.2 },
  light: { label: 'ออกกำลังกายเบา ๆ 1–3 วัน/สัปดาห์', multiplier: 1.375 },
  moderate: { label: 'ออกกำลังกายปานกลาง 3–5 วัน/สัปดาห์', multiplier: 1.55 },
  active: { label: 'ออกกำลังกายหนัก 6–7 วัน/สัปดาห์', multiplier: 1.725 },
  very_active: { label: 'ออกกำลังกายหนักมาก หรือทำงานใช้แรงงาน', multiplier: 1.9 },
}

export const DUPLICATE_FOOD_MESSAGE = 'มีอาหารชื่อนี้อยู่แล้ว กรุณาใช้ชื่ออื่น'
export const ESTIMATE_LABEL = 'ค่าโดยประมาณ'
