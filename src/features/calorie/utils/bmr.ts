import { ACTIVITY_LEVELS, AGE_MAX, AGE_MIN, HEIGHT_MAX, HEIGHT_MIN, WEIGHT_MAX, WEIGHT_MIN } from '../constants.ts'
import type { ActivityLevel, BmrFormInput, BmrResult, BmrValues, Sex } from '../types/calorie'

type BmrBody = Pick<BmrValues, 'sex' | 'age' | 'weightKg' | 'heightCm'>

/** BMR (kcal/วัน) สูตร Mifflin-St Jeor ปัดเป็นจำนวนเต็ม */
export function calculateBmr({ sex, age, weightKg, heightCm }: BmrBody): number {
  const sexOffset = sex === 'male' ? 5 : -161
  return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + sexOffset)
}

/** TDEE (kcal/วัน) = BMR (ที่ปัดแล้ว) × ตัวคูณกิจกรรม ปัดเป็นจำนวนเต็ม */
export function calculateTdee(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_LEVELS[activityLevel].multiplier)
}

export function calculateBmrResult(values: BmrValues): BmrResult {
  const bmr = calculateBmr(values)
  return { bmr, tdee: calculateTdee(bmr, values.activityLevel) }
}

export interface BmrFieldErrors {
  age?: string
  weightKg?: string
  heightCm?: string
}

const INTEGER_PATTERN = /^\d+$/
const ONE_DECIMAL_PATTERN = /^\d+(\.\d)?$/

/** ตรวจค่าจากฟอร์ม: คืน errors (ว่าง = ผ่าน) และค่าที่แปลงเป็นตัวเลขแล้วเมื่อผ่านทั้งหมด */
export function validateBmrInput(input: BmrFormInput): { errors: BmrFieldErrors; values: BmrValues | null } {
  const errors: BmrFieldErrors = {}
  const age = input.age.trim()
  const weight = input.weightKg.trim()
  const height = input.heightCm.trim()

  if (!INTEGER_PATTERN.test(age)) errors.age = 'กรอกอายุเป็นจำนวนเต็ม'
  else if (Number(age) < AGE_MIN || Number(age) > AGE_MAX) errors.age = `อายุต้องอยู่ระหว่าง ${AGE_MIN}–${AGE_MAX} ปี`

  if (!ONE_DECIMAL_PATTERN.test(weight)) errors.weightKg = 'กรอกน้ำหนักเป็นตัวเลข ทศนิยมไม่เกิน 1 ตำแหน่ง'
  else if (Number(weight) < WEIGHT_MIN || Number(weight) > WEIGHT_MAX) {
    errors.weightKg = `น้ำหนักต้องอยู่ระหว่าง ${WEIGHT_MIN}–${WEIGHT_MAX} กก.`
  }

  if (!ONE_DECIMAL_PATTERN.test(height)) errors.heightCm = 'กรอกส่วนสูงเป็นตัวเลข ทศนิยมไม่เกิน 1 ตำแหน่ง'
  else if (Number(height) < HEIGHT_MIN || Number(height) > HEIGHT_MAX) {
    errors.heightCm = `ส่วนสูงต้องอยู่ระหว่าง ${HEIGHT_MIN}–${HEIGHT_MAX} ซม.`
  }

  if (Object.keys(errors).length > 0) return { errors, values: null }
  const sex: Sex = input.sex
  return {
    errors,
    values: {
      sex,
      age: Number(age),
      weightKg: Number(weight),
      heightCm: Number(height),
      activityLevel: input.activityLevel,
    },
  }
}
