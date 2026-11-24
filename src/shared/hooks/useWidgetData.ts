import { useCallback, useEffect, useState } from 'react'
import type { ServiceResult } from '../types/result'

interface Loaded<T> {
  key: number
  result: ServiceResult<T>
}

/**
 * โหลดข้อมูลของการ์ดหนึ่งใบ (แยกจากการ์ดอื่น) fetcher ต้องคงที่ระหว่าง render (ประกาศไว้นอก component หรือห่อ useCallback)
 * ผลที่มาช้าหลังออกจากหน้าจะถูกทิ้ง และ reload() โหลดใหม่โดยไม่ต้อง Reload ทั้งหน้า
 */
export function useWidgetData<T>(fetcher: () => Promise<ServiceResult<T>>) {
  const [refreshKey, setRefreshKey] = useState(0)
  const [loaded, setLoaded] = useState<Loaded<T> | null>(null)

  useEffect(() => {
    let cancelled = false
    const key = refreshKey
    void fetcher().then((result) => {
      if (!cancelled) setLoaded({ key, result })
    })
    return () => {
      cancelled = true
    }
  }, [fetcher, refreshKey])

  const reload = useCallback(() => setRefreshKey((n) => n + 1), [])
  const loading = loaded === null || loaded.key !== refreshKey
  const result = loaded !== null && !loading ? loaded.result : null
  return {
    loading,
    error: result !== null && result.error !== null ? result.error : null,
    data: result !== null && result.error === null ? result.data : null,
    reload,
  }
}
