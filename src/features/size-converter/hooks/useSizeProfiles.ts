import { useCallback, useEffect, useState } from 'react'
import { useToast } from '../../../shared/hooks/useToast'
import { sizeProfileService } from '../services/sizeProfileService'
import type { ProfileValues, SizeProfile } from '../types/size'

interface Loaded {
  key: number
  profiles: SizeProfile[]
  error: string | null
}

export function useSizeProfiles() {
  const toast = useToast()
  const [refreshKey, setRefreshKey] = useState(0)
  const [loaded, setLoaded] = useState<Loaded | null>(null)

  useEffect(() => {
    let cancelled = false
    const key = refreshKey
    void sizeProfileService.list().then((result) => {
      if (cancelled) return
      setLoaded(result.error !== null ? { key, profiles: [], error: result.error } : { key, profiles: result.data, error: null })
    })
    return () => {
      cancelled = true
    }
  }, [refreshKey])

  const loading = loaded === null || loaded.key !== refreshKey
  const firstLoad = loaded === null
  const error = loaded && !loading ? loaded.error : null
  const profiles = loaded?.profiles ?? []
  const hasSelf = profiles.some((p) => p.is_self)

  const refresh = useCallback(() => setRefreshKey((n) => n + 1), [])

  /** คืนข้อความ error (ให้ Form แสดง) หรือ null เมื่อสำเร็จ โปรไฟล์แรก (ที่ยังไม่มี "ฉัน") ตั้งเป็น "ฉัน" อัตโนมัติ */
  const addProfile = useCallback(
    async (values: ProfileValues): Promise<string | null> => {
      const result = await sizeProfileService.create(values, !hasSelf)
      if (result.error !== null) return result.error
      toast.success('เพิ่มโปรไฟล์แล้ว')
      refresh()
      return null
    },
    [hasSelf, toast, refresh],
  )

  const editProfile = useCallback(
    async (id: string, values: ProfileValues): Promise<string | null> => {
      const result = await sizeProfileService.update(id, values)
      if (result.error !== null) return result.error
      toast.success('บันทึกการแก้ไขแล้ว')
      refresh()
      return null
    },
    [toast, refresh],
  )

  const removeProfile = useCallback(
    async (id: string): Promise<void> => {
      const result = await sizeProfileService.remove(id)
      if (result.error !== null) {
        toast.error(result.error)
        return
      }
      toast.success('ลบโปรไฟล์แล้ว')
      refresh()
    },
    [toast, refresh],
  )

  return { profiles, loading, firstLoad, error, reload: refresh, addProfile, editProfile, removeProfile }
}
