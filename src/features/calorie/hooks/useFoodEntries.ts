import { useCallback, useEffect, useState } from 'react'
import { useToast } from '../../../shared/hooks/useToast'
import { entryService } from '../services/entryService'
import type { Food, FoodEntry, FoodEntryInput } from '../types/calorie'

interface LoadedEntries {
  key: string
  entries: FoodEntry[]
  error: string | null
}

/** โหลดรายการอาหารที่กินในช่วงวันที่ from–to (YYYY-MM-DD) */
export function useFoodEntries(from: string, to: string) {
  const toast = useToast()
  const [refreshKey, setRefreshKey] = useState(0)
  const [loaded, setLoaded] = useState<LoadedEntries | null>(null)

  const currentKey = `${from}|${to}|${refreshKey}`

  useEffect(() => {
    let cancelled = false
    const key = `${from}|${to}|${refreshKey}`
    void entryService.listByRange(from, to).then((result) => {
      if (cancelled) return
      setLoaded(
        result.error !== null
          ? { key, entries: [], error: result.error }
          : { key, entries: result.data, error: null },
      )
    })
    return () => {
      cancelled = true
    }
  }, [from, to, refreshKey])

  // ระหว่างโหลดรอบใหม่ (เช่น เปลี่ยนวัน) ยังแสดงข้อมูลเดิมไว้ ไม่กระพริบ
  const loading = loaded?.key !== currentKey
  const firstLoad = loaded === null
  const error = loaded && !loading ? loaded.error : null
  const entries = loaded?.entries ?? []

  const refresh = useCallback(() => setRefreshKey((n) => n + 1), [])

  /** คืนข้อความ error (ให้ Form แสดง) หรือ null เมื่อสำเร็จ */
  const addEntry = useCallback(
    async (input: FoodEntryInput, food: Food): Promise<string | null> => {
      const result = await entryService.create(input, food)
      if (result.error !== null) return result.error
      toast.success('บันทึกรายการอาหารแล้ว')
      refresh()
      return null
    },
    [toast, refresh],
  )

  const editEntry = useCallback(
    async (id: string, input: FoodEntryInput): Promise<string | null> => {
      const result = await entryService.update(id, input)
      if (result.error !== null) return result.error
      toast.success('บันทึกการแก้ไขแล้ว')
      refresh()
      return null
    },
    [toast, refresh],
  )

  const removeEntry = useCallback(
    async (id: string): Promise<void> => {
      const result = await entryService.remove(id)
      if (result.error !== null) {
        toast.error(result.error)
        return
      }
      toast.success('ลบรายการอาหารแล้ว')
      refresh()
    },
    [toast, refresh],
  )

  return { entries, loading, firstLoad, error, reload: refresh, addEntry, editEntry, removeEntry }
}
