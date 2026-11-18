import { useOutletContext } from 'react-router-dom'
import type { SizeProfile } from '../types/size'
import type { useSizeProfiles } from './useSizeProfiles'

/** ข้อมูลที่ SizeConverterLayout ส่งให้หน้าย่อยผ่าน Outlet */
export interface SizeContext extends ReturnType<typeof useSizeProfiles> {
  /** โปรไฟล์ที่เลือกอยู่ (null = ยังไม่มีโปรไฟล์) */
  selected: SizeProfile | null
  selectProfile: (id: string) => void
  /** ที่วางปุ่มของหน้าย่อยในแถวเมนูย่อย (ชิดขวา) null = ยังไม่พร้อม */
  actionSlot: HTMLElement | null
}

export function useSizeContext(): SizeContext {
  return useOutletContext<SizeContext>()
}
