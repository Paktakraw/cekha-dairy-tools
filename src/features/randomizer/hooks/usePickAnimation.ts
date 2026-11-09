import { useCallback, useEffect, useRef, useState } from 'react'
import { SPIN_DURATION_MS, SPIN_TICK_MS } from '../constants'
import type { RandomItem } from '../types/random'
import { pickRandomItem } from '../utils/pool'

/**
 * Animation ตอนกดสุ่ม: สลับแสดงรายการแบบสุ่มเร็ว ๆ ประมาณ 1 วินาที แล้วเรียก onFinish (ซึ่งเป็นตัวสุ่มจริง)
 * - เป็นแค่ effect ทางสายตา ผลจริงตัดสินตอน onFinish
 * - ถ้าผู้ใช้ตั้งค่า "ลดการเคลื่อนไหว" ในระบบ จะข้าม animation
 * - ถ้า component ถูก unmount ระหว่างหมุน (เช่น สลับแท็บ) จะยกเลิกโดยไม่สุ่ม
 */
export function usePickAnimation(candidates: RandomItem[], onFinish: () => void) {
  const [spinning, setSpinning] = useState(false)
  const [preview, setPreview] = useState<RandomItem | null>(null)
  const timers = useRef<{ interval?: number; timeout?: number }>({})

  const clearTimers = useCallback(() => {
    window.clearInterval(timers.current.interval)
    window.clearTimeout(timers.current.timeout)
    timers.current = {}
  }, [])

  useEffect(() => clearTimers, [clearTimers])

  const start = useCallback(() => {
    if (spinning || candidates.length === 0) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onFinish()
      return
    }

    setSpinning(true)
    setPreview(pickRandomItem(candidates))
    timers.current.interval = window.setInterval(() => setPreview(pickRandomItem(candidates)), SPIN_TICK_MS)
    timers.current.timeout = window.setTimeout(() => {
      clearTimers()
      setSpinning(false)
      setPreview(null)
      onFinish()
    }, SPIN_DURATION_MS)
  }, [spinning, candidates, onFinish, clearTimers])

  return { spinning, preview, start }
}
