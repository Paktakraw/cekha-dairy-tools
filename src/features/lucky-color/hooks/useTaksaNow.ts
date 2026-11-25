import { useEffect, useState } from 'react'

/** เวลาปัจจุบันสำหรับคำนวณสี: คำนวณใหม่เมื่อกลับมาที่แท็บ (เผื่อเปิดค้างข้ามเวลา 06:00 / 18:00) ไม่ใช้ตัวจับเวลา */
export function useTaksaNow(): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === 'visible') setNow(new Date())
    }
    document.addEventListener('visibilitychange', refresh)
    return () => document.removeEventListener('visibilitychange', refresh)
  }, [])
  return now
}
