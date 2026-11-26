import { test, expect } from '@playwright/test'

test('ผู้ใช้ที่ยังไม่ล็อกอินถูกส่งไปหน้าเข้าสู่ระบบ', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/login$/)
})
