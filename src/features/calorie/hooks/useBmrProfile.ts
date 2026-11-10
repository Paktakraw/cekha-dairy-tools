import { useCallback, useEffect, useState } from 'react'
import { useToast } from '../../../shared/hooks/useToast'
import type { ServiceResult } from '../../../shared/types/result'
import { profileService } from '../services/profileService'
import type { BmrResult, BmrValues, CalorieProfile } from '../types/calorie'

export function useBmrProfile() {
  const toast = useToast()
  const [profile, setProfile] = useState<CalorieProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const applyResult = useCallback((result: ServiceResult<CalorieProfile | null>) => {
    if (result.error !== null) setError(result.error)
    else setProfile(result.data)
    setLoading(false)
  }, [])

  useEffect(() => {
    let cancelled = false
    void profileService.get().then((result) => {
      if (!cancelled) applyResult(result)
    })
    return () => {
      cancelled = true
    }
  }, [applyResult])

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    applyResult(await profileService.get())
  }, [applyResult])

  /** คืนข้อความ error (ให้ Form แสดง) หรือ null เมื่อสำเร็จ */
  const saveProfile = useCallback(
    async (values: BmrValues, result: BmrResult): Promise<string | null> => {
      const saved = await profileService.save(values, result)
      if (saved.error !== null) return saved.error
      setProfile(saved.data)
      toast.success('บันทึกผลการคำนวณแล้ว')
      return null
    },
    [toast],
  )

  return { profile, loading, error, reload, saveProfile }
}
