import { useCallback, useEffect, useState } from 'react'
import { useToast } from '../../../shared/hooks/useToast'
import { transactionService } from '../services/transactionService'
import type { Transaction, TransactionFilters, TransactionInput } from '../types/finance'

interface LoadedTransactions {
  key: string
  transactions: Transaction[]
  error: string | null
}

/**
 * filters ต้องเป็นค่าที่เสถียร (state หรือค่าคงที่) เพื่อไม่ให้โหลดซ้ำโดยไม่จำเป็น
 * limit: ระบุเมื่อต้องการเฉพาะรายการล่าสุด ไม่ระบุ = ทุกรายการที่ตรงกับ filter
 */
export function useTransactions(filters: TransactionFilters, limit?: number) {
  const toast = useToast()
  const [refreshKey, setRefreshKey] = useState(0)
  const [loaded, setLoaded] = useState<LoadedTransactions | null>(null)

  const currentKey = `${JSON.stringify(filters)}|${limit ?? 'all'}|${refreshKey}`

  useEffect(() => {
    let cancelled = false
    const key = `${JSON.stringify(filters)}|${limit ?? 'all'}|${refreshKey}`
    void transactionService.list(filters, limit).then((result) => {
      if (cancelled) return
      setLoaded(
        result.error !== null
          ? { key, transactions: [], error: result.error }
          : { key, transactions: result.data, error: null },
      )
    })
    return () => {
      cancelled = true
    }
  }, [filters, limit, refreshKey])

  // ระหว่างโหลดรอบใหม่ ยังแสดงข้อมูลเดิมไว้ ไม่กระพริบ
  const loading = loaded?.key !== currentKey
  const firstLoad = loaded === null
  const error = loaded && !loading ? loaded.error : null
  const transactions = loaded?.transactions ?? []

  const refresh = useCallback(() => setRefreshKey((n) => n + 1), [])

  /** คืนข้อความ error (ให้ Form แสดง) หรือ null เมื่อสำเร็จ */
  const addTransaction = useCallback(
    async (input: TransactionInput): Promise<string | null> => {
      const result = await transactionService.create(input)
      if (result.error !== null) return result.error
      toast.success('บันทึกรายการแล้ว')
      refresh()
      return null
    },
    [toast, refresh],
  )

  const editTransaction = useCallback(
    async (id: string, input: TransactionInput): Promise<string | null> => {
      const result = await transactionService.update(id, input)
      if (result.error !== null) return result.error
      toast.success('บันทึกการแก้ไขแล้ว')
      refresh()
      return null
    },
    [toast, refresh],
  )

  const removeTransaction = useCallback(
    async (id: string): Promise<void> => {
      const result = await transactionService.remove(id)
      if (result.error !== null) {
        toast.error(result.error)
        return
      }
      toast.success('ลบรายการแล้ว')
      refresh()
    },
    [toast, refresh],
  )

  return {
    transactions,
    loading,
    firstLoad,
    error,
    reload: refresh,
    addTransaction,
    editTransaction,
    removeTransaction,
  }
}
