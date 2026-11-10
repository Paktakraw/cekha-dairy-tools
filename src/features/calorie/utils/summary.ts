import { MEAL_ORDER } from '../constants.ts'
import type { DaySummary, FoodEntry, MealType, RangeSummary } from '../types/calorie'
import { listDates } from './dates.ts'

/**
 * แคลอรี่ของรายการ (kcal เป็นจำนวนเต็ม) = แคลอรี่ต่อหน่วย × จำนวนหน่วย
 * คำนวณด้วยจำนวนเต็ม (kcal มีทศนิยม 1 ตำแหน่ง, จำนวนหน่วยมี 2 ตำแหน่ง) แล้วปัดครั้งเดียว
 */
export function entryCalories(kcalPerUnit: number, quantity: number): number {
  return Math.round((Math.round(kcalPerUnit * 10) * Math.round(quantity * 100)) / 1000)
}

function entryTotal(entry: FoodEntry): number {
  return entryCalories(entry.kcal_per_unit, entry.quantity)
}

/** สรุปของวันเดียว: รวมรายมื้อและรวมทั้งวัน (มีครบทุกมื้อตามลำดับ แม้ไม่มีรายการ) */
export function summarizeDay(entries: FoodEntry[]): DaySummary {
  const meals = MEAL_ORDER.map((meal) => {
    const mealEntries = entries.filter((e) => e.meal === meal)
    return { meal, total: mealEntries.reduce((sum, e) => sum + entryTotal(e), 0), entries: mealEntries }
  })
  return { total: meals.reduce((sum, m) => sum + m.total, 0), meals }
}

/**
 * สรุปช่วงวันที่ (สัปดาห์/เดือน)
 * - รายการวันในผลลัพธ์ไม่รวมวันหลัง today (ยังมาไม่ถึง)
 * - ค่าเฉลี่ยต่อวันคิดเฉพาะวันที่มีบันทึก เพื่อไม่ให้วันที่ลืมบันทึกดึงค่าเฉลี่ยลง
 */
export function summarizeRange(entries: FoodEntry[], from: string, to: string, today: string): RangeSummary {
  const totalByDate = new Map<string, number>()
  const totalByMeal = new Map<MealType, number>()
  for (const entry of entries) {
    const kcal = entryTotal(entry)
    totalByDate.set(entry.eaten_on, (totalByDate.get(entry.eaten_on) ?? 0) + kcal)
    totalByMeal.set(entry.meal, (totalByMeal.get(entry.meal) ?? 0) + kcal)
  }

  const days = listDates(from, to < today ? to : today).map((date) => ({ date, total: totalByDate.get(date) ?? 0 }))
  const total = days.reduce((sum, d) => sum + d.total, 0)
  const loggedDays = days.filter((d) => totalByDate.has(d.date)).length

  return {
    days,
    total,
    loggedDays,
    averagePerLoggedDay: loggedDays === 0 ? null : Math.round(total / loggedDays),
    byMeal: MEAL_ORDER.map((meal) => ({ meal, total: totalByMeal.get(meal) ?? 0 })),
  }
}
