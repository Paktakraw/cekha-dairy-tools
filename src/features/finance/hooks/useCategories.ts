import { useCallback, useEffect, useMemo, useState } from 'react'
import { useToast } from '../../../shared/hooks/useToast'
import type { ServiceResult } from '../../../shared/types/result'
import { categoryService } from '../services/categoryService'
import type { Category, CategoryInput } from '../types/finance'

export function useCategories() {
  const toast = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const applyResult = useCallback((result: ServiceResult<Category[]>) => {
    if (result.error !== null) setError(result.error)
    else setCategories(result.data)
    setLoading(false)
  }, [])

  useEffect(() => {
    let cancelled = false
    void categoryService.listWithSeed().then((result) => {
      if (!cancelled) applyResult(result)
    })
    return () => {
      cancelled = true
    }
  }, [applyResult])

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    applyResult(await categoryService.listWithSeed())
  }, [applyResult])

  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])

  // add/edit คืนข้อความ error (ให้ Form แสดง) หรือ null เมื่อสำเร็จ
  const addCategory = useCallback(
    async (input: CategoryInput): Promise<string | null> => {
      const result = await categoryService.create(input)
      if (result.error !== null) return result.error
      setCategories((prev) => [...prev, result.data])
      toast.success('เพิ่มหมวดหมู่แล้ว')
      return null
    },
    [toast],
  )

  const editCategory = useCallback(
    async (id: string, input: CategoryInput): Promise<string | null> => {
      const result = await categoryService.update(id, input)
      if (result.error !== null) return result.error
      setCategories((prev) => prev.map((c) => (c.id === id ? result.data : c)))
      toast.success('บันทึกการแก้ไขแล้ว')
      return null
    },
    [toast],
  )

  const removeCategory = useCallback(
    async (id: string): Promise<void> => {
      const result = await categoryService.remove(id)
      if (result.error !== null) {
        toast.error(result.error)
        return
      }
      setCategories((prev) => prev.filter((c) => c.id !== id))
      toast.success('ลบหมวดหมู่แล้ว')
    },
    [toast],
  )

  return { categories, categoryById, loading, error, reload, addCategory, editCategory, removeCategory }
}
