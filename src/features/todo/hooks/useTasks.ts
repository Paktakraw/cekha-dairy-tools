import { useCallback, useEffect, useState } from 'react'
import { useToast } from '../../../shared/hooks/useToast'
import { PAGE_SIZE } from '../constants'
import { taskService } from '../services/taskService'
import type { Task, TaskInput, TaskStatus } from '../types/task'

interface LoadedPage {
  key: string
  tasks: Task[]
  total: number
  error: string | null
}

const makeKey = (statuses: TaskStatus[], page: number, refreshKey: number) =>
  `${statuses.join(',')}|${page}|${refreshKey}`

export function useTasks() {
  const toast = useToast()
  const [statuses, setStatuses] = useState<TaskStatus[]>([])
  const [page, setPage] = useState(1)
  const [refreshKey, setRefreshKey] = useState(0)
  const [loaded, setLoaded] = useState<LoadedPage | null>(null)

  const currentKey = makeKey(statuses, page, refreshKey)

  useEffect(() => {
    let cancelled = false
    const key = makeKey(statuses, page, refreshKey)
    void taskService.list(statuses, page).then((result) => {
      if (cancelled) return
      setLoaded(
        result.error !== null
          ? { key, tasks: [], total: 0, error: result.error }
          : { key, tasks: result.data.tasks, total: result.data.total, error: null },
      )
    })
    return () => {
      cancelled = true
    }
  }, [statuses, page, refreshKey])

  // ยังโหลดไม่เสร็จสำหรับ query ปัจจุบัน (ระหว่างนั้นยังแสดงข้อมูลเดิมไว้ ไม่กระพริบ)
  const loading = loaded?.key !== currentKey
  const firstLoad = loaded === null
  const error = loaded && !loading ? loaded.error : null
  const tasks = loaded?.tasks ?? []
  const total = loaded?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const refresh = useCallback(() => setRefreshKey((n) => n + 1), [])

  const toggleStatusFilter = useCallback((status: TaskStatus) => {
    setStatuses((prev) => (prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]))
    setPage(1)
  }, [])

  const clearStatusFilter = useCallback(() => {
    setStatuses([])
    setPage(1)
  }, [])

  /** คืนข้อความ error (ให้ Form แสดง) หรือ null เมื่อสำเร็จ */
  const addTask = useCallback(
    async (input: TaskInput): Promise<string | null> => {
      const result = await taskService.create(input)
      if (result.error !== null) return result.error
      toast.success('เพิ่มงานแล้ว')
      if (page === 1) refresh()
      else setPage(1)
      return null
    },
    [toast, page, refresh],
  )

  const editTask = useCallback(
    async (id: string, input: TaskInput): Promise<string | null> => {
      const result = await taskService.update(id, input)
      if (result.error !== null) return result.error
      toast.success('บันทึกการแก้ไขแล้ว')
      refresh()
      return null
    },
    [toast, refresh],
  )

  const changeStatus = useCallback(
    async (task: Task, status: TaskStatus): Promise<void> => {
      if (task.status === status) return
      const result = await taskService.setStatus(task.id, status)
      if (result.error !== null) {
        toast.error(result.error)
        return
      }
      // ถ้า filter อยู่แล้วงานนี้เป็นรายการสุดท้ายของหน้า งานจะหลุดจากหน้านี้ ให้ถอยกลับหนึ่งหน้า
      if (statuses.length > 0 && tasks.length === 1 && page > 1) setPage(page - 1)
      else refresh()
    },
    [toast, refresh, statuses.length, tasks.length, page],
  )

  const removeTask = useCallback(
    async (id: string): Promise<void> => {
      const result = await taskService.remove(id)
      if (result.error !== null) {
        toast.error(result.error)
        return
      }
      toast.success('ลบงานแล้ว')
      // ถ้าลบรายการสุดท้ายของหน้า ให้ถอยกลับไปหน้าก่อนหน้า
      if (tasks.length === 1 && page > 1) setPage(page - 1)
      else refresh()
    },
    [toast, tasks.length, page, refresh],
  )

  return {
    tasks,
    total,
    page,
    totalPages,
    statuses,
    loading,
    firstLoad,
    error,
    setPage,
    toggleStatusFilter,
    clearStatusFilter,
    reload: refresh,
    addTask,
    editTask,
    changeStatus,
    removeTask,
  }
}
