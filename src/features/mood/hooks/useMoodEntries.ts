import { useCallback, useEffect, useState } from 'react'
import { useToast } from '../../../shared/hooks/useToast'
import { moodService } from '../services/moodService'
import type { DetailValues, MoodEntry, MoodScore } from '../types/mood'

interface Loaded {
  key: string
  entries: MoodEntry[]
  error: string | null
}

/** โหลดการเช็กอินในช่วงวันที่ พร้อมฟังก์ชันบันทึก/ลบ (โหลดซ้ำอัตโนมัติหลังแก้) */
export function useMoodEntries(from: string, to: string) {
  const toast = useToast()
  const [refreshKey, setRefreshKey] = useState(0)
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const key = `${from}|${to}|${refreshKey}`

  useEffect(() => {
    let cancelled = false
    void moodService.listRange(from, to).then((result) => {
      if (cancelled) return
      setLoaded(result.error !== null ? { key, entries: [], error: result.error } : { key, entries: result.data, error: null })
    })
    return () => {
      cancelled = true
    }
  }, [from, to, key])

  const loading = loaded === null || loaded.key !== key
  const firstLoad = loaded === null
  const error = loaded && !loading ? loaded.error : null
  const entries = loaded?.entries ?? []

  const refresh = useCallback(() => setRefreshKey((n) => n + 1), [])

  const setMood = useCallback(
    async (date: string, mood: MoodScore): Promise<string | null> => {
      const result = await moodService.saveMood(date, mood)
      if (result.error !== null) {
        toast.error(result.error)
        return result.error
      }
      refresh()
      return null
    },
    [toast, refresh],
  )

  const saveDetails = useCallback(
    async (date: string, mood: MoodScore, details: DetailValues): Promise<string | null> => {
      const result = await moodService.saveDetails(date, mood, details)
      if (result.error !== null) return result.error
      toast.success('บันทึกแล้ว')
      refresh()
      return null
    },
    [toast, refresh],
  )

  const removeEntry = useCallback(
    async (id: string): Promise<boolean> => {
      const result = await moodService.remove(id)
      if (result.error !== null) {
        toast.error(result.error)
        return false
      }
      toast.success('ลบการเช็กอินแล้ว')
      refresh()
      return true
    },
    [toast, refresh],
  )

  return { entries, loading, firstLoad, error, reload: refresh, setMood, saveDetails, removeEntry }
}
