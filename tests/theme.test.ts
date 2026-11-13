import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { DEFAULT_THEME, resolveTheme } from '../src/shared/utils/theme.ts'

describe('resolveTheme', () => {
  it('ค่าเริ่มต้นเป็นสว่าง', () => {
    assert.equal(DEFAULT_THEME, 'light')
  })

  it('รับค่า light และ dark ตามที่เป็น', () => {
    assert.equal(resolveTheme('light'), 'light')
    assert.equal(resolveTheme('dark'), 'dark')
  })

  it('ค่าที่ไม่รู้จักถือเป็นสว่าง (รวม null, undefined, ตัวพิมพ์ใหญ่, system)', () => {
    for (const value of [null, undefined, '', 'Dark', 'DARK', 'system', 'auto', 1, true, {}]) {
      assert.equal(resolveTheme(value), 'light')
    }
  })
})
