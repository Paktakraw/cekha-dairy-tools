import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { applyTheme, readCachedTheme, writeCachedTheme } from '../../shared/lib/themeStorage'
import { useAuth } from '../../shared/hooks/useAuth'
import { useToast } from '../../shared/hooks/useToast'
import { preferenceService } from '../../shared/services/preferenceService'
import { DEFAULT_THEME, type Theme } from '../../shared/utils/theme'
import { ThemeContext, type ThemeContextValue } from './ThemeContext'

/**
 * จุดเดียวที่จัดการธีมสว่าง/มืด
 * - เริ่มจากแคชในเบราว์เซอร์ (กันหน้าจอวาบขาว) หรือสว่างถ้าไม่มี แล้วโหลดค่าจริงจาก Supabase เมื่อมี session
 * - เปลี่ยนธีมแล้วใช้ทันที บันทึกเบื้องหลัง; กดสลับเร็ว ๆ ส่งเฉพาะค่าล่าสุด
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const toast = useToast()
  const userId = user?.id ?? null
  const [theme, setThemeState] = useState<Theme>(() => readCachedTheme() ?? DEFAULT_THEME)
  // ผู้ใช้กดเลือกเองแล้ว: ค่าที่โหลดมาทีหลังต้องไม่ทับ
  const touched = useRef(false)
  const queue = useRef<{ saving: boolean; latest: Theme | null }>({ saving: false, latest: null })

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    void preferenceService.getTheme().then((result) => {
      if (cancelled || touched.current || result.error !== null) return
      const loaded = result.data ?? DEFAULT_THEME
      setThemeState(loaded)
      writeCachedTheme(loaded)
    })
    return () => {
      cancelled = true
    }
  }, [userId])

  const setTheme = useCallback(
    (next: Theme) => {
      touched.current = true
      setThemeState(next)
      writeCachedTheme(next)
      if (!userId) return

      const state = queue.current
      state.latest = next
      if (state.saving) return
      state.saving = true
      void (async () => {
        while (state.latest !== null) {
          const value = state.latest
          state.latest = null
          const result = await preferenceService.saveTheme(value)
          if (result.error !== null) toast.error(result.error)
        }
        state.saving = false
      })()
    },
    [userId, toast],
  )

  const value = useMemo<ThemeContextValue>(() => ({ theme, setTheme }), [theme, setTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
