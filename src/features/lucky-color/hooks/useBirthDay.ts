import { useCallback, useEffect, useRef, useState } from 'react'
import { useToast } from '../../../shared/hooks/useToast'
import { luckyColorProfileService } from '../services/luckyColorProfileService'
import type { TaksaDay } from '../types/luckyColor'

/**
 * วันเกิดที่เลือกอยู่: ผลลัพธ์บนหน้าอ้างอิงค่า selected ทันที ส่วนการบันทึกทำเบื้องหลังต่อคิว
 * (กดสลับรัว ๆ แล้วค่าสุดท้ายที่ลง DB ต้องเป็นตัวสุดท้ายที่เลือก)
 */
export function useBirthDay() {
  const toast = useToast()
  const [selected, setSelected] = useState<TaksaDay | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const saveQueue = useRef<Promise<void>>(Promise.resolve())

  useEffect(() => {
    let cancelled = false
    void luckyColorProfileService.get().then((result) => {
      if (cancelled) return
      if (result.error !== null) setError(result.error)
      else setSelected(result.data?.birth_day ?? null)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [refreshKey])

  const reload = useCallback(() => {
    setLoading(true)
    setError(null)
    setRefreshKey((n) => n + 1)
  }, [])

  const choose = useCallback(
    (day: TaksaDay) => {
      setSelected(day)
      saveQueue.current = saveQueue.current.then(async () => {
        const saved = await luckyColorProfileService.save(day)
        if (saved.error !== null) toast.error(saved.error)
      })
    },
    [toast],
  )

  return { selected, loading, error, reload, choose }
}
