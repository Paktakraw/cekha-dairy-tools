import { useCallback, useEffect, useState } from 'react'
import { useToast } from '../../../shared/hooks/useToast'
import type { ServiceResult } from '../../../shared/types/result'
import { randomService } from '../services/randomService'
import type { RandomData, RandomGroup, RandomItem } from '../types/random'

/** CRUD กลุ่มและรายการ (ข้อมูลถาวรใน Supabase) */
export function useGroups() {
  const toast = useToast()
  const [groups, setGroups] = useState<RandomGroup[]>([])
  const [items, setItems] = useState<RandomItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const applyResult = useCallback((result: ServiceResult<RandomData>) => {
    if (result.error !== null) {
      setError(result.error)
    } else {
      setGroups(result.data.groups)
      setItems(result.data.items)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    let cancelled = false
    void randomService.listAll().then((result) => {
      if (!cancelled) applyResult(result)
    })
    return () => {
      cancelled = true
    }
  }, [applyResult])

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    applyResult(await randomService.listAll())
  }, [applyResult])

  // add/edit คืนข้อความ error (ให้ Form แสดง) หรือ null เมื่อสำเร็จ
  const addGroup = useCallback(
    async (name: string): Promise<string | null> => {
      const result = await randomService.createGroup(name)
      if (result.error !== null) return result.error
      setGroups((prev) => [...prev, result.data])
      toast.success('เพิ่มกลุ่มแล้ว')
      return null
    },
    [toast],
  )

  const editGroup = useCallback(
    async (id: string, name: string): Promise<string | null> => {
      const result = await randomService.updateGroup(id, name)
      if (result.error !== null) return result.error
      setGroups((prev) => prev.map((g) => (g.id === id ? result.data : g)))
      toast.success('บันทึกการแก้ไขแล้ว')
      return null
    },
    [toast],
  )

  /** คืน true เมื่อลบสำเร็จ */
  const removeGroup = useCallback(
    async (id: string): Promise<boolean> => {
      const result = await randomService.deleteGroup(id)
      if (result.error !== null) {
        toast.error(result.error)
        return false
      }
      setGroups((prev) => prev.filter((g) => g.id !== id))
      setItems((prev) => prev.filter((i) => i.group_id !== id))
      toast.success('ลบกลุ่มแล้ว')
      return true
    },
    [toast],
  )

  const addItem = useCallback(
    async (groupId: string, label: string): Promise<string | null> => {
      const result = await randomService.createItem(groupId, label)
      if (result.error !== null) return result.error
      setItems((prev) => [...prev, result.data])
      toast.success('เพิ่มรายการแล้ว')
      return null
    },
    [toast],
  )

  const editItem = useCallback(
    async (id: string, label: string): Promise<string | null> => {
      const result = await randomService.updateItem(id, label)
      if (result.error !== null) return result.error
      setItems((prev) => prev.map((i) => (i.id === id ? result.data : i)))
      toast.success('บันทึกการแก้ไขแล้ว')
      return null
    },
    [toast],
  )

  const removeItem = useCallback(
    async (id: string): Promise<void> => {
      const result = await randomService.deleteItem(id)
      if (result.error !== null) {
        toast.error(result.error)
        return
      }
      setItems((prev) => prev.filter((i) => i.id !== id))
      toast.success('ลบรายการแล้ว')
    },
    [toast],
  )

  return { groups, items, loading, error, reload, addGroup, editGroup, removeGroup, addItem, editItem, removeItem }
}
