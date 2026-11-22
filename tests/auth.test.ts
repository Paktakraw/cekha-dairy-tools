import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import type { RegisterInput } from '../src/features/auth/types/auth.ts'
import {
  normalizePhone,
  normalizeUsername,
  takenFieldsToErrors,
  utf8ByteLength,
  toAuthEmail,
  validateLogin,
  validateRegister,
} from '../src/features/auth/utils/auth.ts'

const valid: RegisterInput = {
  firstName: 'สมชาย',
  lastName: 'ใจดี',
  username: 'somchai.j',
  email: 'somchai@example.com',
  phone: '081-234-5678',
  password: 'password123',
  confirmPassword: 'password123',
}

describe('normalize', () => {
  it('username ตัดช่องว่างและเป็นตัวพิมพ์เล็ก', () => {
    assert.equal(normalizeUsername('  SomChai '), 'somchai')
  })

  it('เบอร์โทรเก็บเฉพาะตัวเลขและแปลง +66 เป็น 0', () => {
    assert.equal(normalizePhone('081-234 5678'), '0812345678')
    assert.equal(normalizePhone('+66 81 234 5678'), '0812345678')
  })

  it('อีเมลสังเคราะห์ใช้ username ตัวพิมพ์เล็ก', () => {
    assert.equal(toAuthEmail('SomChai', 'example.org'), 'somchai@example.org')
  })
})

describe('validateRegister', () => {
  it('ข้อมูลถูกต้องไม่มี error', () => {
    assert.deepEqual(validateRegister(valid), {})
  })

  it('ช่องว่างทุกช่องต้องมี error', () => {
    const errors = validateRegister({ firstName: '', lastName: '', username: '', email: '', phone: '', password: '', confirmPassword: '' })
    assert.deepEqual(Object.keys(errors).sort(), ['email', 'firstName', 'lastName', 'password', 'phone', 'username'])
  })

  it('username สั้น/ยาวเกิน/มีอักขระต้องห้ามไม่ผ่าน', () => {
    assert.ok(validateRegister({ ...valid, username: 'ab' }).username)
    assert.ok(validateRegister({ ...valid, username: 'a'.repeat(31) }).username)
    assert.ok(validateRegister({ ...valid, username: 'some chai' }).username)
    assert.ok(validateRegister({ ...valid, username: 'สมชาย' }).username)
  })

  it('username ตัวพิมพ์ใหญ่ผ่าน (ถูกแปลงเป็นตัวพิมพ์เล็ก)', () => {
    assert.equal(validateRegister({ ...valid, username: 'SomChai' }).username, undefined)
  })

  it('อีเมลรูปแบบผิดไม่ผ่าน', () => {
    assert.ok(validateRegister({ ...valid, email: 'abc' }).email)
    assert.ok(validateRegister({ ...valid, email: 'a@b' }).email)
  })

  it('เบอร์โทรต้อง 10 หลักขึ้นต้น 0', () => {
    assert.ok(validateRegister({ ...valid, phone: '12345' }).phone)
    assert.ok(validateRegister({ ...valid, phone: '1812345678' }).phone)
    assert.equal(validateRegister({ ...valid, phone: '+66812345678' }).phone, undefined)
  })

  it('รหัสผ่านสั้นกว่า 8 หรือยาวเกิน 72 ไม่ผ่าน', () => {
    assert.ok(validateRegister({ ...valid, password: '1234567', confirmPassword: '1234567' }).password)
    const long = 'a'.repeat(73)
    assert.ok(validateRegister({ ...valid, password: long, confirmPassword: long }).password)
  })

  it('รหัสผ่านจำกัดเป็นไบต์: ภาษาไทย 25 ตัว (75 ไบต์) ไม่ผ่าน แต่ 24 ตัว (72 ไบต์) ผ่าน', () => {
    const thai24 = 'ก'.repeat(24)
    const thai25 = 'ก'.repeat(25)
    assert.equal(utf8ByteLength(thai24), 72)
    assert.equal(validateRegister({ ...valid, password: thai24, confirmPassword: thai24 }).password, undefined)
    assert.ok(validateRegister({ ...valid, password: thai25, confirmPassword: thai25 }).password)
  })

  it('รหัสผ่านยืนยันต้องตรงกัน', () => {
    assert.ok(validateRegister({ ...valid, confirmPassword: 'other-pass' }).confirmPassword)
  })
})

describe('validateLogin', () => {
  it('ต้องกรอกทั้งสองช่อง', () => {
    assert.deepEqual(Object.keys(validateLogin({ username: ' ', password: '' })).sort(), ['password', 'username'])
    assert.deepEqual(validateLogin({ username: 'a', password: 'b' }), {})
  })
})

describe('takenFieldsToErrors', () => {
  it('แปลงฟิลด์ที่ซ้ำเป็นข้อความตามช่อง และข้ามค่าที่ไม่รู้จัก', () => {
    const errors = takenFieldsToErrors(['username', 'phone', 'other'])
    assert.deepEqual(Object.keys(errors).sort(), ['phone', 'username'])
  })

  it('ไม่ซ้ำเลยได้ object ว่าง', () => {
    assert.deepEqual(takenFieldsToErrors([]), {})
  })
})
