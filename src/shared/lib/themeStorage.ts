import { resolveTheme, type Theme } from '../utils/theme'

/** ต้องตรงกับ key ในสคริปต์ตั้งธีมก่อนโหลดใน index.html */
export const THEME_STORAGE_KEY = 'theme'

/** แคชธีมในเบราว์เซอร์ (ค่าหลักอยู่ที่ Supabase) ใช้กันหน้าจอวาบขาว localStorage ใช้ไม่ได้ก็ไม่เป็นไร */
export function readCachedTheme(): Theme | null {
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY)
    return saved === null ? null : resolveTheme(saved)
  } catch {
    return null
  }
}

export function writeCachedTheme(theme: Theme): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // ไม่เป็นไร: แค่แคชไม่ได้
  }
}

/** ตั้งธีมที่ <html> (สีจริงกำหนดใน src/styles/index.css) */
export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme
}
