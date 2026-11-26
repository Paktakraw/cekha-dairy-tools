import { test as setup, expect } from '@playwright/test'

const AUTH_FILE = 'e2e/.auth/user.json'

setup('เข้าสู่ระบบด้วยบัญชีทดสอบ', async ({ page }) => {
  const username = process.env.E2E_USERNAME
  const password = process.env.E2E_PASSWORD
  if (!username || !password) throw new Error('ต้องตั้ง E2E_USERNAME และ E2E_PASSWORD ใน .env.local')
  if (process.env.E2E_CONFIRM_TEST_ACCOUNT !== 'yes')
    throw new Error('เทสต์จะลบและเขียนข้อมูลของบัญชีนี้ ตั้ง E2E_CONFIRM_TEST_ACCOUNT=yes เพื่อยืนยันว่าเป็นบัญชีทดสอบ')

  await page.goto('/login')
  await page.getByLabel('ชื่อผู้ใช้').fill(username)
  await page.getByLabel('รหัสผ่าน').fill(password)
  await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click()
  await expect(page).not.toHaveURL(/\/login$/)
  await page.context().storageState({ path: AUTH_FILE })
})
