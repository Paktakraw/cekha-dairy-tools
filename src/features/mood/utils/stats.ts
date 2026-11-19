import type { MoodEntry, MoodScore, MoodShare, MoodTagId } from '../types/mood'
import { addDays } from './calendar.ts'

const SCORES: MoodScore[] = [5, 4, 3, 2, 1]

/**
 * สัดส่วนอารมณ์เป็น % จำนวนเต็ม รวมกันได้ 100 พอดี (ปัดแบบ largest remainder)
 * ไม่มีข้อมูล = ทุกระดับเป็น 0
 */
export function moodShares(entries: Pick<MoodEntry, 'mood'>[]): MoodShare[] {
  const total = entries.length
  const counts = SCORES.map((score) => entries.filter((e) => e.mood === score).length)
  if (total === 0) return SCORES.map((score, i) => ({ score, count: counts[i], percent: 0 }))

  const exact = counts.map((c) => (c * 100) / total)
  const percents = exact.map(Math.floor)
  let remaining = 100 - percents.reduce((a, b) => a + b, 0)
  // เศษมากสุดได้ก่อน เท่ากันให้ระดับที่ดีกว่า (ลำดับ SCORES) ได้ก่อน
  const order = exact.map((value, i) => ({ i, frac: value - percents[i] })).sort((a, b) => b.frac - a.frac || a.i - b.i)
  for (const { i } of order) {
    if (remaining <= 0) break
    if (counts[i] === 0) continue
    percents[i] += 1
    remaining -= 1
  }
  return SCORES.map((score, i) => ({ score, count: counts[i], percent: percents[i] }))
}

/** อารมณ์ที่พบบ่อยสุด ถ้าเท่ากันเลือกระดับที่ดีกว่า ไม่มีข้อมูล = null */
export function dominantMood(shares: MoodShare[]): MoodScore | null {
  let best: MoodShare | null = null
  for (const share of shares) {
    if (share.count > 0 && (best === null || share.count > best.count)) best = share
  }
  return best?.score ?? null
}

/** แท็กที่พบบ่อยสุด n อันดับ (เท่ากันเรียงตามลำดับในชุดแท็ก ผู้เรียกส่ง order มา) */
export function topTags(entries: Pick<MoodEntry, 'tags'>[], n: number, order: MoodTagId[]): { tag: MoodTagId; count: number }[] {
  const counts = new Map<MoodTagId, number>()
  for (const entry of entries) for (const tag of entry.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1)
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || order.indexOf(a.tag) - order.indexOf(b.tag))
    .slice(0, n)
}

/** จำนวนวันติดกันที่เป็นอารมณ์ score นับถอยหลังจาก endDate (วันที่ไม่มีข้อมูลตัดสาย) */
export function consecutiveDaysWithMood(entries: Pick<MoodEntry, 'entry_date' | 'mood'>[], score: MoodScore, endDate: string): number {
  const dates = new Set(entries.filter((e) => e.mood === score).map((e) => e.entry_date))
  let count = 0
  for (let date = endDate; dates.has(date); date = addDays(date, -1)) count += 1
  return count
}
