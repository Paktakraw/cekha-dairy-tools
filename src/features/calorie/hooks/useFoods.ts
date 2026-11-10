import { useCallback, useEffect, useMemo, useState } from 'react'
import { useToast } from '../../../shared/hooks/useToast'
import type { ServiceResult } from '../../../shared/types/result'
import { foodService } from '../services/foodService'
import type { Food, FoodInput } from '../types/calorie'

export function useFoods() {
  const toast = useToast()
  const [foods, setFoods] = useState<Food[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const applyResult = useCallback((result: ServiceResult<Food[]>) => {
    if (result.error !== null) setError(result.error)
    else setFoods(result.data)
    setLoading(false)
  }, [])

  useEffect(() => {
    let cancelled = false
    void foodService.listWithSeed().then((result) => {
      if (!cancelled) applyResult(result)
    })
    return () => {
      cancelled = true
    }
  }, [applyResult])

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    applyResult(await foodService.listWithSeed())
  }, [applyResult])

  const sortByName = (list: Food[]) => [...list].sort((a, b) => a.name.localeCompare(b.name, 'th'))

  const foodById = useMemo(() => new Map(foods.map((f) => [f.id, f])), [foods])

  // add/edit คืนข้อความ error (ให้ Form แสดง) หรือ null เมื่อสำเร็จ
  const addFood = useCallback(
    async (input: FoodInput): Promise<string | null> => {
      const result = await foodService.create(input)
      if (result.error !== null) return result.error
      setFoods((prev) => sortByName([...prev, result.data]))
      toast.success('เพิ่มอาหารแล้ว')
      return null
    },
    [toast],
  )

  const editFood = useCallback(
    async (id: string, input: FoodInput): Promise<string | null> => {
      const result = await foodService.update(id, input)
      if (result.error !== null) return result.error
      setFoods((prev) => sortByName(prev.map((f) => (f.id === id ? result.data : f))))
      toast.success('บันทึกการแก้ไขแล้ว')
      return null
    },
    [toast],
  )

  const removeFood = useCallback(
    async (id: string): Promise<void> => {
      const result = await foodService.remove(id)
      if (result.error !== null) {
        toast.error(result.error)
        return
      }
      setFoods((prev) => prev.filter((f) => f.id !== id))
      toast.success('ลบอาหารแล้ว')
    },
    [toast],
  )

  return { foods, foodById, loading, error, reload, addFood, editFood, removeFood }
}
