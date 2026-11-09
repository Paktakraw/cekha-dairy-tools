import { useCallback, useMemo, useState } from 'react'
import type { RandomItem, SessionState } from '../types/random'
import { buildPool, pickRandomItem, splitPool } from '../utils/pool'

const EMPTY_SESSION: Omit<SessionState, 'selectedGroupIds'> = { excludedIds: [], lastPickedId: null }

/**
 * Session การสุ่ม (client state เท่านั้น หายเมื่อรีเฟรชหน้า)
 * Pool ทั้งหมดคำนวณ (derive) จาก items ปัจจุบัน + id ที่เลือก/ที่สุ่มไปแล้ว
 * ดังนั้นรายการที่ถูกลบหายจาก pool เอง และรายการที่แก้ label อัปเดตตาม id โดยอัตโนมัติ
 */
export function useRandomSession(items: RandomItem[]) {
  const [state, setState] = useState<SessionState>({ selectedGroupIds: [], ...EMPTY_SESSION })

  const pool = useMemo(() => buildPool(items, state.selectedGroupIds), [items, state.selectedGroupIds])
  const { current, excluded } = useMemo(() => splitPool(pool, state.excludedIds), [pool, state.excludedIds])
  const lastPicked = useMemo(() => pool.find((i) => i.id === state.lastPickedId) ?? null, [pool, state.lastPickedId])

  /** เปลี่ยนกลุ่มที่เลือก = Reset Session อัตโนมัติ */
  const toggleGroup = useCallback((groupId: string) => {
    setState((prev) => ({
      selectedGroupIds: prev.selectedGroupIds.includes(groupId)
        ? prev.selectedGroupIds.filter((id) => id !== groupId)
        : [...prev.selectedGroupIds, groupId],
      ...EMPTY_SESSION,
    }))
  }, [])

  const pick = useCallback(() => {
    const picked = pickRandomItem(current)
    if (!picked) return
    setState((prev) => ({ ...prev, excludedIds: [...prev.excludedIds, picked.id], lastPickedId: picked.id }))
  }, [current])

  /** Reset Session: คืนรายการที่สุ่มไปแล้วกลับเข้า Current Pool (คงกลุ่มที่เลือกไว้) */
  const reset = useCallback(() => {
    setState((prev) => ({ ...prev, ...EMPTY_SESSION }))
  }, [])

  /** กลุ่มถูกลบ: เอาออกจากที่เลือก ถ้ากลุ่มนั้นถูกเลือกอยู่จะ Reset Session */
  const handleGroupDeleted = useCallback((groupId: string) => {
    setState((prev) =>
      prev.selectedGroupIds.includes(groupId)
        ? { selectedGroupIds: prev.selectedGroupIds.filter((id) => id !== groupId), ...EMPTY_SESSION }
        : prev,
    )
  }, [])

  /** กลุ่มถูกแก้ไข: ถ้ากลุ่มนั้นถูกเลือกอยู่จะ Reset Session */
  const handleGroupEdited = useCallback((groupId: string) => {
    setState((prev) => (prev.selectedGroupIds.includes(groupId) ? { ...prev, ...EMPTY_SESSION } : prev))
  }, [])

  return {
    selectedGroupIds: state.selectedGroupIds,
    pool,
    current,
    excluded,
    lastPicked,
    toggleGroup,
    pick,
    reset,
    handleGroupDeleted,
    handleGroupEdited,
  }
}
