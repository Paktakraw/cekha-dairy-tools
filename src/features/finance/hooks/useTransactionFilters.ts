import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { EMPTY_FILTERS, type TransactionFilters } from '../types/finance'

const SEARCH_DEBOUNCE_MS = 300

/** state ของ Filter หน้า Summary: เลือกเดือน/ปี กับช่วงวันที่ใช้แทนกัน, ค้นหาด้วย debounce */
export function useTransactionFilters() {
  const [filters, setFilters] = useState<TransactionFilters>(EMPTY_FILTERS)
  const [searchInput, setSearchInput] = useState('')
  const debounceTimer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(debounceTimer.current), [])

  const update = useCallback((patch: Partial<Omit<TransactionFilters, 'search'>>) => {
    setFilters((prev) => {
      const next = { ...prev, ...patch }
      if (patch.month) {
        next.dateFrom = ''
        next.dateTo = ''
      } else if (patch.dateFrom || patch.dateTo) {
        next.month = ''
      }
      return next
    })
  }, [])

  const setSearch = useCallback((value: string) => {
    setSearchInput(value)
    window.clearTimeout(debounceTimer.current)
    debounceTimer.current = window.setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: value }))
    }, SEARCH_DEBOUNCE_MS)
  }, [])

  const reset = useCallback(() => {
    window.clearTimeout(debounceTimer.current)
    setSearchInput('')
    setFilters(EMPTY_FILTERS)
  }, [])

  const isFiltered = useMemo(
    () => JSON.stringify(filters) !== JSON.stringify(EMPTY_FILTERS) || searchInput !== '',
    [filters, searchInput],
  )

  const invalidRange = filters.dateFrom !== '' && filters.dateTo !== '' && filters.dateFrom > filters.dateTo

  return { filters, searchInput, update, setSearch, reset, isFiltered, invalidRange }
}
