import { useCallback, useEffect, useState } from 'react'
import { useToast } from '../../../shared/hooks/useToast'
import { reminderItemService } from '../services/reminderItemService'
import type { CompleteValues, ItemValues, ReminderItem } from '../types/reminder'

interface Loaded {
  key: number
  items: ReminderItem[]
  error: string | null
}

/** โหลดและจัดการรายการทั้งหมด (ใช้งานอยู่ + เก็บถาวร) */
export function useReminderItems() {
  const toast = useToast()
  const [refreshKey, setRefreshKey] = useState(0)
  const [loaded, setLoaded] = useState<Loaded | null>(null)

  useEffect(() => {
    let cancelled = false
    const key = refreshKey
    void reminderItemService.list().then((result) => {
      if (cancelled) return
      setLoaded(result.error !== null ? { key, items: [], error: result.error } : { key, items: result.data, error: null })
    })
    return () => {
      cancelled = true
    }
  }, [refreshKey])

  const loading = loaded === null || loaded.key !== refreshKey
  const firstLoad = loaded === null
  const error = loaded && !loading ? loaded.error : null
  const items = loaded?.items ?? []

  const refresh = useCallback(() => setRefreshKey((n) => n + 1), [])

  /** คืนข้อความ error (ให้ Form แสดง) หรือ null เมื่อสำเร็จ */
  const addItem = useCallback(
    async (values: ItemValues): Promise<string | null> => {
      const result = await reminderItemService.create(values)
      if (result.error !== null) return result.error
      toast.success('เพิ่มรายการแล้ว')
      refresh()
      return null
    },
    [toast, refresh],
  )

  const editItem = useCallback(
    async (id: string, values: ItemValues): Promise<string | null> => {
      const result = await reminderItemService.update(id, values)
      if (result.error !== null) return result.error
      toast.success('บันทึกการแก้ไขแล้ว')
      refresh()
      return null
    },
    [toast, refresh],
  )

  const removeItem = useCallback(
    async (id: string): Promise<void> => {
      const result = await reminderItemService.remove(id)
      if (result.error !== null) {
        toast.error(result.error)
        return
      }
      toast.success('ลบรายการแล้ว')
      refresh()
    },
    [toast, refresh],
  )

  const completeItem = useCallback(
    async (id: string, values: CompleteValues): Promise<string | null> => {
      const result = await reminderItemService.complete(id, values)
      if (result.error !== null) return result.error
      toast.success(values.next_due === null ? 'บันทึกแล้ว และเก็บรายการเข้าแท็บเก็บถาวร' : 'บันทึกแล้ว และเลื่อนวันครบกำหนดให้แล้ว')
      refresh()
      return null
    },
    [toast, refresh],
  )

  return { items, loading, firstLoad, error, reload: refresh, addItem, editItem, removeItem, completeItem }
}
