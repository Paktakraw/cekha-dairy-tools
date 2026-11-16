import { useEffect, useState } from 'react'
import { reminderLogService } from '../services/reminderLogService'
import type { ReminderLog } from '../types/reminder'

interface Loaded {
  itemId: string
  attempt: number
  logs: ReminderLog[]
  error: string | null
}

/** โหลดประวัติของรายการ (itemId = null คือยังไม่ได้เปิดดู ไม่โหลด) */
export function useReminderLogs(itemId: string | null) {
  const [attempt, setAttempt] = useState(0)
  const [loaded, setLoaded] = useState<Loaded | null>(null)

  useEffect(() => {
    if (itemId === null) return
    let cancelled = false
    void reminderLogService.listByItem(itemId).then((result) => {
      if (cancelled) return
      setLoaded(
        result.error !== null
          ? { itemId, attempt, logs: [], error: result.error }
          : { itemId, attempt, logs: result.data, error: null },
      )
    })
    return () => {
      cancelled = true
    }
  }, [itemId, attempt])

  const ready = itemId !== null && loaded !== null && loaded.itemId === itemId && loaded.attempt === attempt
  return {
    loading: itemId !== null && !ready,
    logs: ready ? loaded.logs : [],
    error: ready ? loaded.error : null,
    reload: () => setAttempt((n) => n + 1),
  }
}
