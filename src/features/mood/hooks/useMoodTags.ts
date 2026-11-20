import { useCallback, useEffect, useRef, useState } from 'react'
import { useToast } from '../../../shared/hooks/useToast'
import { moodTagService } from '../services/moodTagService'
import type { MoodTag, MoodTagGroup } from '../types/mood'

interface Loaded {
  key: number
  tags: MoodTag[]
  error: string | null
}

/** แท็กของผู้ใช้ (โหลดครั้งเดียวที่ Layout) พร้อมเพิ่ม/แก้/ลบ; ถ้ายังไม่มีแท็กเลยจะใส่แท็กเริ่มต้นให้ก่อน */
export function useMoodTags() {
  const toast = useToast()
  const [refreshKey, setRefreshKey] = useState(0)
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  // โหลดสำเร็จแล้วหรือยัง (ใช้ตัดสินว่าจะใส่แท็กเริ่มต้นหรือไม่ ครั้งที่โหลดล้มเหลวแล้วกด "ลองใหม่" ยังนับเป็นครั้งแรก)
  const loadedOnce = useRef(false)

  useEffect(() => {
    let cancelled = false
    const key = refreshKey
    void (async () => {
      let result = await moodTagService.list()
      // ใส่แท็กเริ่มต้นเฉพาะตอนโหลดสำเร็จครั้งแรกหลังเปิดฟีเจอร์ ถ้าผู้ใช้ลบจนหมดระหว่างใช้งาน ต้องค้างว่างไว้
      // ไม่ใส่คืนทันที จะกลับมาเมื่อเข้าฟีเจอร์ใหม่ (Layout ถูกสร้างใหม่) (RPC เป็น idempotent)
      if (!loadedOnce.current && result.error === null && result.data.length === 0) {
        const seeded = await moodTagService.seedDefaults()
        if (seeded.error === null) result = await moodTagService.list()
        else result = { data: null, error: seeded.error }
      }
      if (cancelled) return
      if (result.error === null) loadedOnce.current = true
      setLoaded(result.error !== null ? { key, tags: [], error: result.error } : { key, tags: result.data, error: null })
    })()
    return () => {
      cancelled = true
    }
  }, [refreshKey])

  const loading = loaded === null || loaded.key !== refreshKey
  const firstLoad = loaded === null
  const error = loaded && !loading ? loaded.error : null
  const tags = loaded?.tags ?? []

  const refresh = useCallback(() => setRefreshKey((n) => n + 1), [])

  const addTag = useCallback(
    async (group: MoodTagGroup, name: string): Promise<string | null> => {
      const result = await moodTagService.create(group, name)
      if (result.error !== null) return result.error
      toast.success('เพิ่มแท็กแล้ว')
      refresh()
      return null
    },
    [toast, refresh],
  )

  const renameTag = useCallback(
    async (id: string, name: string): Promise<string | null> => {
      const result = await moodTagService.rename(id, name)
      if (result.error !== null) return result.error
      toast.success('บันทึกการแก้ไขแล้ว')
      refresh()
      return null
    },
    [toast, refresh],
  )

  const removeTag = useCallback(
    async (id: string): Promise<boolean> => {
      const result = await moodTagService.remove(id)
      if (result.error !== null) {
        toast.error(result.error)
        return false
      }
      toast.success('ลบแท็กแล้ว')
      refresh()
      return true
    },
    [toast, refresh],
  )

  return { tags, loading, firstLoad, error, reload: refresh, addTag, renameTag, removeTag }
}
