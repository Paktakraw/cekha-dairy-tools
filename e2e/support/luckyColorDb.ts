import type { Page } from '@playwright/test'

interface StoredSession {
  access_token: string
  user: { id: string }
}

const TABLE_PATH = '/rest/v1/lucky_color_profiles'

function isStoredSession(value: unknown): value is StoredSession {
  if (typeof value !== 'object' || value === null) return false
  const { access_token: token, user } = value as Partial<StoredSession>
  return typeof token === 'string' && typeof user?.id === 'string'
}

async function readSession(page: Page): Promise<StoredSession> {
  const raw = await page.evaluate(() => {
    const key = Object.keys(localStorage).find((k) => /^sb-.*-auth-token$/.test(k))
    return key ? localStorage.getItem(key) : null
  })
  if (!raw) throw new Error('ไม่พบ session ของ Supabase ใน localStorage')
  const parsed: unknown = JSON.parse(raw)
  if (!isStoredSession(parsed)) throw new Error('รูปแบบ session ของ Supabase ใน localStorage ไม่ตรงที่คาดไว้')
  return parsed
}

async function callTable(page: Page, method: 'DELETE' | 'POST', body?: object) {
  const session = await readSession(page)
  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) throw new Error('ต้องตั้ง VITE_SUPABASE_URL และ VITE_SUPABASE_PUBLISHABLE_KEY')
  const headers = {
    apikey: key,
    Authorization: `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
    Prefer: 'resolution=merge-duplicates',
  }
  const query = method === 'DELETE' ? `?user_id=eq.${session.user.id}` : '?on_conflict=user_id'
  const response = await page.request.fetch(`${url}${TABLE_PATH}${query}`, {
    method,
    headers,
    data: body,
  })
  if (!response.ok()) throw new Error(`${method} ${TABLE_PATH} ล้มเหลว: ${response.status()}`)
}

export async function clearBirthDay(page: Page) {
  await callTable(page, 'DELETE')
}

export async function seedBirthDay(page: Page, birthDay: string) {
  await callTable(page, 'POST', { birth_day: birthDay })
}
