import { useOutletContext } from 'react-router-dom'
import type { useMoodTags } from './useMoodTags'

/** ข้อมูลที่ MoodLayout ส่งให้หน้าย่อยผ่าน Outlet (แท็กของผู้ใช้ + ฟังก์ชันจัดการแท็ก) */
export type MoodContext = ReturnType<typeof useMoodTags>

export function useMoodContext(): MoodContext {
  return useOutletContext<MoodContext>()
}
