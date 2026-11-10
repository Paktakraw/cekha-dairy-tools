export type Sex = 'male' | 'female'

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

/** 'seed' = ข้อมูลตั้งต้น (ค่าโดยประมาณ), 'user' = ผู้ใช้เพิ่มเอง */
export type FoodSource = 'seed' | 'user'

/** Row จากตาราง calorie_profiles (ไม่ select user_id) */
export interface CalorieProfile {
  id: string
  sex: Sex
  age: number
  weight_kg: number
  height_cm: number
  activity_level: ActivityLevel
  bmr: number
  tdee: number
  created_at: string
  updated_at: string
}

/** ข้อมูลจาก Form BMR (ตัวเลขเป็น string เพราะมาจากช่องกรอก) */
export interface BmrFormInput {
  sex: Sex
  age: string
  weightKg: string
  heightCm: string
  activityLevel: ActivityLevel
}

/** ค่าที่ผ่านการตรวจสอบแล้ว */
export interface BmrValues {
  sex: Sex
  age: number
  weightKg: number
  heightCm: number
  activityLevel: ActivityLevel
}

export interface BmrResult {
  bmr: number
  tdee: number
}

/** Row จากตาราง foods (ไม่ select user_id) */
export interface Food {
  id: string
  name: string
  serving_unit: string
  kcal_per_unit: number
  source: FoodSource
  created_at: string
  updated_at: string
}

/** ข้อมูลจาก Form อาหาร (kcal เป็น string เพราะมาจากช่องกรอก) */
export interface FoodInput {
  name: string
  serving_unit: string
  kcal_per_unit: string
}

/** Row จากตาราง food_entries (ไม่ select user_id) — ชื่อ/หน่วย/แคลอรี่เป็นสำเนา ณ ตอนบันทึก */
export interface FoodEntry {
  id: string
  /** YYYY-MM-DD */
  eaten_on: string
  meal: MealType
  food_id: string | null
  food_name: string
  serving_unit: string
  kcal_per_unit: number
  quantity: number
  created_at: string
  updated_at: string
}

/** ข้อมูลจาก Form บันทึกอาหาร (quantity เป็น string เพราะมาจากช่องกรอก) */
export interface FoodEntryInput {
  eaten_on: string
  meal: MealType
  quantity: string
}

export interface MealSummary {
  meal: MealType
  total: number
  entries: FoodEntry[]
}

export interface DaySummary {
  /** แคลอรี่รวมของวัน (kcal) */
  total: number
  /** เรียงตามลำดับมื้อ (เช้า → ของว่าง) มีครบทุกมื้อ */
  meals: MealSummary[]
}

export interface DayTotal {
  date: string
  total: number
}

export interface RangeSummary {
  /** ทุกวันในช่วงที่ไม่เกินวันนี้ เรียงจากวันแรกไปวันสุดท้าย */
  days: DayTotal[]
  total: number
  /** จำนวนวันที่มีการบันทึกอาหาร */
  loggedDays: number
  /** ค่าเฉลี่ยต่อวัน เฉพาะวันที่มีบันทึก (null ถ้าไม่มีวันไหนเลย) */
  averagePerLoggedDay: number | null
  /** แคลอรี่รวมแยกตามมื้อ */
  byMeal: { meal: MealType; total: number }[]
}

export type SummaryPeriod = 'week' | 'month'
