import { test, expect, type Locator, type Page } from '@playwright/test'
import { clearBirthDay, seedBirthDay } from './support/luckyColorDb.ts'

const DAYS = [
  { value: 'sun', name: 'อาทิตย์' },
  { value: 'mon', name: 'จันทร์' },
  { value: 'tue', name: 'อังคาร' },
  { value: 'wed_day', name: 'พุธกลางวัน' },
  { value: 'wed_night', name: 'พุธกลางคืน (ราหู)' },
  { value: 'thu', name: 'พฤหัสบดี' },
  { value: 'fri', name: 'ศุกร์' },
  { value: 'sat', name: 'เสาร์' },
] as const

const WEDNESDAY_NOON = '2026-11-25T12:00:00+07:00'
const DISCLAIMER = 'เพื่อความบันเทิงและความสบายใจ ไม่ใช่คำทำนาย'

async function openFresh(page: Page, at = WEDNESDAY_NOON) {
  await page.clock.setFixedTime(new Date(at))
  await page.goto('/')
  await clearBirthDay(page)
  await page.goto('/lucky-color')
}

async function openWithBirthDay(page: Page, birthDay: string, at = WEDNESDAY_NOON) {
  await page.clock.setFixedTime(new Date(at))
  await page.goto('/')
  await seedBirthDay(page, birthDay)
  await page.goto('/lucky-color')
  await expect(page.getByText(DISCLAIMER)).toBeVisible()
}

async function expandOverview(page: Page): Promise<Locator> {
  const overview = page.locator('section[aria-labelledby="today-overview-title"]')
  const toggle = overview.getByRole('button', { name: 'ขยายภาพรวมวันนี้' })
  if ((await toggle.count()) > 0) await toggle.click()
  return overview
}

function waitForSave(page: Page, birthDay: string) {
  return page.waitForResponse(
    (response) =>
      response.url().includes('/rest/v1/lucky_color_profiles') &&
      response.request().method() === 'POST' &&
      (response.request().postData() ?? '').includes(`"${birthDay}"`),
  )
}

function section(page: Page, title: string): Locator {
  return page.locator('section', { has: page.getByRole('heading', { name: title }) })
}

async function chipTexts(scope: Locator): Promise<string[]> {
  const texts = await scope.locator('span.inline-flex.rounded-full').allInnerTexts()
  return texts.flatMap((text) => text.split('/').map((part) => part.trim()))
}

test.describe('สีที่ใช่', () => {
  test('TC-LUCKY-M01 เข้าครั้งแรกเห็นตัวเลือกวันเกิด 8 วันและยังไม่มีผลสี', async ({ page }) => {
    await openFresh(page)
    const radios = page.getByRole('radio')
    await expect(radios).toHaveCount(8)
    for (const day of DAYS) await expect(page.getByRole('radio', { name: day.name, exact: true })).toBeVisible()
    await expect(page.getByText('พุธกลางวัน เกิดตั้งแต่ 06:00 ถึง 17:59 น.')).toBeVisible()
    await expect(page.getByRole('heading', { name: /สีปังคูณสอง/ })).toHaveCount(0)
  })

  test('TC-LUCKY-M02 เลือกวันเกิดแล้วผลขึ้นทันทีครบ 3 ส่วน', async ({ page }) => {
    await openFresh(page)
    await page.getByRole('radio', { name: 'จันทร์', exact: true }).click()
    await expect(page.getByText('สวัสดีวันพุธ! นี่คือสีที่ใช่สำหรับคนเกิดวันจันทร์โดยเฉพาะ')).toBeVisible()
    const headings = await page.getByRole('heading', { level: 2 }).allInnerTexts()
    expect(headings.slice(-3)).toEqual([
      '🌟 สีปังคูณสอง (ใส่แล้วดีรอบด้าน)',
      '💼 สีเสริมตามเรื่องที่ต้องการ',
      '🚫 สีต้องห้ามวันนี้ (เลี่ยงได้เลี่ยง)',
    ])
    await expect(page.getByLabel('วันเกิดของคุณ')).toHaveValue('mon')
    await expect(page.getByText(DISCLAIMER)).toBeVisible()
  })

  test('TC-LUCKY-M03 สลับวันเกิดครบ 8 วันแล้วผลเปลี่ยนทันที', async ({ page }) => {
    await openWithBirthDay(page, 'sun')
    const picker = page.getByLabel('วันเกิดของคุณ')
    const greetings = new Set<string>()
    for (const day of DAYS) {
      await picker.selectOption(day.value)
      await expect(picker).toHaveValue(day.value)
      const greeting = page.getByText(`นี่คือสีที่ใช่สำหรับคนเกิดวัน${day.name}โดยเฉพาะ`)
      await expect(greeting).toBeVisible()
      greetings.add(await greeting.innerText())
      await expect(page.getByRole('status')).toHaveCount(0)
    }
    expect(greetings.size).toBe(8)
  })

  test('TC-LUCKY-M04 วันเกิดล่าสุดคงอยู่หลังรีเฟรช', async ({ page }) => {
    await openWithBirthDay(page, 'sun')
    const picker = page.getByLabel('วันเกิดของคุณ')
    const lastSaved = waitForSave(page, 'fri')
    for (const value of ['mon', 'tue', 'wed_night', 'fri']) await picker.selectOption(value)
    await lastSaved
    await expect(picker).toHaveValue('fri')
    await page.reload()
    await expect(page.getByLabel('วันเกิดของคุณ')).toHaveValue('fri')
  })

  test('TC-LUCKY-M05 เกิดวันจันทร์ × พุธกลางวัน ตรงตามตัวอย่างตำรา', async ({ page }) => {
    await openWithBirthDay(page, 'mon')
    const avoid = section(page, '🚫 สีต้องห้ามวันนี้ (เลี่ยงได้เลี่ยง)')
    expect((await chipTexts(avoid)).sort()).toEqual(['ชมพู', 'แดง'])
    await expect(avoid.getByText('กาลกิณีวันเกิด')).toBeVisible()
    await expect(avoid.getByText('กาลกิณีวันนี้')).toBeVisible()
    await expect(section(page, '🌟 สีปังคูณสอง (ใส่แล้วดีรอบด้าน)').getByText('-', { exact: true })).toBeVisible()
    const boost = section(page, '💼 สีเสริมตามเรื่องที่ต้องการ')
    await expect(boost.locator('div', { has: page.getByText('การงาน (เดช)') }).last()).toContainText('เขียว')
    await expect(boost).toContainText('ส้ม')
    await expect(boost).toContainText('ม่วง')
    await expect(boost).toContainText('ดำ / เทา')
    await expect(boost).toContainText('ฟ้า / น้ำเงิน')
    await expect(boost).toContainText('เหลือง')
  })

  const TIME_EDGES = [
    { at: '2026-11-25T05:59:00+07:00', label: 'สวัสดีวันอังคาร!' },
    { at: '2026-11-25T06:00:00+07:00', label: 'สวัสดีวันพุธ!' },
    { at: '2026-11-25T17:59:00+07:00', label: 'สวัสดีวันพุธ!' },
    { at: '2026-11-25T18:00:00+07:00', label: 'สวัสดีคืนวันพุธ (ราหู)!' },
    { at: '2026-11-26T05:59:00+07:00', label: 'สวัสดีคืนวันพุธ (ราหู)!' },
    { at: '2026-11-26T06:00:00+07:00', label: 'สวัสดีวันพฤหัสบดี!' },
  ]
  for (const edge of TIME_EDGES) {
    test(`TC-LUCKY-M06 ขอบเวลา ${edge.at}`, async ({ page }) => {
      await openWithBirthDay(page, 'mon', edge.at)
      await expect(page.getByText(edge.label)).toBeVisible()
    })
  }

  for (const day of DAYS) {
    test(`TC-LUCKY-M07 สีต้องห้ามไม่หลุดไปส่วนอื่น (เกิด${day.name})`, async ({ page }) => {
      await openWithBirthDay(page, day.value)
      const forbidden = await chipTexts(section(page, '🚫 สีต้องห้ามวันนี้ (เลี่ยงได้เลี่ยง)'))
      const others = [
        ...(await chipTexts(section(page, '🌟 สีปังคูณสอง (ใส่แล้วดีรอบด้าน)'))),
        ...(await chipTexts(section(page, '💼 สีเสริมตามเรื่องที่ต้องการ'))),
      ]
      expect(forbidden.length).toBeGreaterThan(0)
      for (const color of forbidden) expect(others).not.toContain(color)
    })
  }

  test('TC-LUCKY-M08 ทุกชิปมีชื่อสีกำกับ และตัวเลือกวันเกิดจัดคอลัมน์ตามขนาดจอ', async ({ page }) => {
    await openFresh(page)
    const group = page.getByRole('radiogroup', { name: 'วันเกิด' })
    await expect(group.getByRole('radio')).toHaveCount(8)
    await page.setViewportSize({ width: 375, height: 800 })
    const columnsOf = async () => {
      const boxes = await group.getByRole('radio').evaluateAll((els) =>
        els.map((el) => Math.round(el.getBoundingClientRect().left)),
      )
      return new Set(boxes).size
    }
    expect(await columnsOf()).toBe(2)
    await page.setViewportSize({ width: 1280, height: 800 })
    expect(await columnsOf()).toBe(4)

    await page.getByRole('radio', { name: 'จันทร์', exact: true }).click()
    const chips = page.locator('span.inline-flex.rounded-full')
    const count = await chips.count()
    expect(count).toBeGreaterThan(0)
    for (let i = 0; i < count; i++) expect((await chips.nth(i).innerText()).trim()).not.toBe('')
  })

  test('TC-LUCKY-M09 โหลดวันเกิดไม่สำเร็จ แสดงข้อผิดพลาดและปุ่มลองใหม่ที่ใช้ได้', async ({ page }) => {
    await page.clock.setFixedTime(new Date(WEDNESDAY_NOON))
    await page.goto('/')
    await seedBirthDay(page, 'mon')
    const profileApi = '**/rest/v1/lucky_color_profiles*'
    await page.route(profileApi, (route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: '{"message":"boom"}' }),
    )
    await page.goto('/lucky-color')
    await expect(page.getByText('โหลดวันเกิดไม่สำเร็จ', { exact: true })).toBeVisible()
    await page.unroute(profileApi)
    await page.getByRole('button', { name: 'ลองใหม่' }).click()
    await expect(page.getByLabel('วันเกิดของคุณ')).toHaveValue('mon')
  })

  test('TC-LUCKY-M09 บันทึกวันเกิดไม่สำเร็จ ผลบนหน้าเปลี่ยนตามที่เลือกและแจ้ง Toast', async ({ page }) => {
    await openWithBirthDay(page, 'mon')
    await page.route('**/rest/v1/lucky_color_profiles*', (route) =>
      route.request().method() === 'POST' ? route.abort() : route.continue(),
    )
    await page.getByLabel('วันเกิดของคุณ').selectOption('tue')
    await expect(page.getByText('นี่คือสีที่ใช่สำหรับคนเกิดวันอังคารโดยเฉพาะ')).toBeVisible()
    await expect(page.getByText('บันทึกวันเกิดไม่สำเร็จ กรุณาลองใหม่')).toBeVisible()
  })

  test('TC-LUCKY-M11 การ์ดในภาพรวมวันนี้ตรงกับหน้า /lucky-color และกดแล้วไปหน้านั้น', async ({ page }) => {
    await openWithBirthDay(page, 'mon')
    const avoidChips = await chipTexts(section(page, '🚫 สีต้องห้ามวันนี้ (เลี่ยงได้เลี่ยง)'))
    await page.goto('/')
    const overview = await expandOverview(page)
    const card = overview.getByRole('link', { name: /สีที่ใช่/ })
    await expect(card).toBeVisible()
    for (const color of avoidChips) await expect(card).toContainText(color)
    await expect(card).toContainText('เลี่ยง')
    await card.click()
    await expect(page).toHaveURL(/\/lucky-color$/)
  })

  test('TC-LUCKY-M11 ยังไม่เลือกวันเกิด การ์ดแสดงข้อความชวนเลือก', async ({ page }) => {
    await openFresh(page)
    await page.goto('/')
    const overview = await expandOverview(page)
    await expect(overview.getByText('ยังไม่ได้เลือกวันเกิด')).toBeVisible()
  })

  test('TC-LUCKY-M12 สลับวันเกิดแล้วกลับหน้าหลัก การ์ดตามวันเกิดล่าสุด', async ({ page }) => {
    await openWithBirthDay(page, 'sun')
    const saved = waitForSave(page, 'mon')
    await page.getByLabel('วันเกิดของคุณ').selectOption('mon')
    await saved
    await page.goto('/')
    const overview = await expandOverview(page)
    const card = overview.getByRole('link', { name: /สีที่ใช่/ })
    await expect(card).toContainText('แดง')
    await expect(card).toContainText('ชมพู')
  })
})
