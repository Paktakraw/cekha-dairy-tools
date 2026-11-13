export const THEMES = ['light', 'dark'] as const

export type Theme = (typeof THEMES)[number]

/** ผู้ใช้ที่ยังไม่เคยเลือกเป็นสว่างเสมอ (ไม่ดูการตั้งค่าของเครื่อง) */
export const DEFAULT_THEME: Theme = 'light'

/** รับค่าอะไรก็ได้ (จากแคช/ฐานข้อมูล) คืน Theme ที่ถูกต้อง ค่าที่ไม่รู้จักถือเป็นสว่าง */
export function resolveTheme(value: unknown): Theme {
  return value === 'dark' ? 'dark' : DEFAULT_THEME
}
