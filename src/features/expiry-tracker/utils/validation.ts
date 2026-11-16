import {
  COST_MAX,
  NAME_MAX_LENGTH,
  NOTE_MAX_LENGTH,
  PROVIDER_NAME_MAX_LENGTH,
  PROVIDER_PHONE_MAX_LENGTH,
  REMIND_DAYS_MAX,
  REMIND_LEVELS_MAX,
  REPEAT_EVERY_MAX,
  USAGE_MAX,
  USAGE_UNIT_MAX_LENGTH,
} from '../constants.ts'
import type {
  CompleteFieldErrors,
  CompleteFormInput,
  CompleteValues,
  ItemFieldErrors,
  ItemFormInput,
  ItemValues,
  ReminderItem,
} from '../types/reminder'
import { isValidISODate } from './dates.ts'

export interface ItemValidation {
  errors: ItemFieldErrors
  values: ItemValues | null
}

export interface CompleteValidation {
  errors: CompleteFieldErrors
  values: CompleteValues | null
}

const MONEY_PATTERN = /^\d+(\.\d{1,2})?$/
const ONE_DECIMAL_PATTERN = /^\d+(\.\d)?$/
const INTEGER_PATTERN = /^\d+$/

/** อ่านเงิน (รองรับคอมมา) คืน null ถ้ารูปแบบไม่ถูกต้อง */
function parseMoney(raw: string): number | null {
  const text = raw.trim().replace(/,/g, '')
  return MONEY_PATTERN.test(text) ? Number(text) : null
}

function parseOneDecimal(raw: string): number | null {
  const text = raw.trim().replace(/,/g, '')
  return ONE_DECIMAL_PATTERN.test(text) ? Number(text) : null
}

function trimmedOrNull(raw: string): string | null {
  const text = raw.trim()
  return text === '' ? null : text
}

/** จัดระดับเตือน: ตัดซ้ำ เรียงมากไปน้อย */
export function normalizeRemindDays(days: number[]): number[] {
  return [...new Set(days)].sort((a, b) => b - a)
}

export function validateItem(input: ItemFormInput): ItemValidation {
  const errors: ItemFieldErrors = {}

  const name = input.name.trim()
  if (name === '') errors.name = 'กรุณากรอกชื่อรายการ'
  else if (name.length > NAME_MAX_LENGTH) errors.name = `ชื่อต้องไม่เกิน ${NAME_MAX_LENGTH} ตัวอักษร`

  if (!isValidISODate(input.dueDate)) errors.dueDate = 'กรุณาเลือกวันครบกำหนด'

  let repeatEvery: number | null = null
  if (input.repeatEvery.trim() !== '') {
    const text = input.repeatEvery.trim()
    if (!INTEGER_PATTERN.test(text) || Number(text) < 1 || Number(text) > REPEAT_EVERY_MAX) {
      errors.repeatEvery = `รอบทำซ้ำเป็นจำนวนเต็ม 1–${REPEAT_EVERY_MAX}`
    } else repeatEvery = Number(text)
  }

  let cost: number | null = null
  if (input.cost.trim() !== '') {
    cost = parseMoney(input.cost)
    if (cost === null) errors.cost = 'กรอกค่าใช้จ่ายเป็นตัวเลข ทศนิยมไม่เกิน 2 ตำแหน่ง'
    else if (cost > COST_MAX) errors.cost = `ค่าใช้จ่ายต้องไม่เกิน ${COST_MAX.toLocaleString('th-TH')}`
  }

  if (input.providerName.trim().length > PROVIDER_NAME_MAX_LENGTH) errors.providerName = `ต้องไม่เกิน ${PROVIDER_NAME_MAX_LENGTH} ตัวอักษร`
  if (input.providerPhone.trim().length > PROVIDER_PHONE_MAX_LENGTH) errors.providerPhone = `ต้องไม่เกิน ${PROVIDER_PHONE_MAX_LENGTH} ตัวอักษร`
  if (input.note.trim().length > NOTE_MAX_LENGTH) errors.note = `หมายเหตุต้องไม่เกิน ${NOTE_MAX_LENGTH} ตัวอักษร`

  const remindDays = normalizeRemindDays(input.remindBeforeDays)
  if (remindDays.some((d) => !Number.isInteger(d) || d < 0 || d > REMIND_DAYS_MAX)) {
    errors.remindBeforeDays = `จำนวนวันต้องเป็นจำนวนเต็ม 0–${REMIND_DAYS_MAX}`
  } else if (remindDays.length > REMIND_LEVELS_MAX) {
    errors.remindBeforeDays = `ตั้งเตือนได้ไม่เกิน ${REMIND_LEVELS_MAX} ระดับ`
  }

  let usageUnit: string | null = null
  let usageInterval: number | null = null
  let usageLastDone: number | null = null
  let usageCurrent: number | null = null
  if (input.usageEnabled) {
    usageUnit = trimmedOrNull(input.usageUnit)
    if (usageUnit === null) errors.usageUnit = 'กรุณากรอกหน่วย เช่น กม.'
    else if (usageUnit.length > USAGE_UNIT_MAX_LENGTH) errors.usageUnit = `หน่วยต้องไม่เกิน ${USAGE_UNIT_MAX_LENGTH} ตัวอักษร`

    usageInterval = parseOneDecimal(input.usageInterval)
    if (usageInterval === null || usageInterval <= 0) {
      errors.usageInterval = 'กรอกระยะที่ครบรอบเป็นตัวเลขมากกว่า 0'
      usageInterval = null
    } else if (usageInterval > USAGE_MAX) errors.usageInterval = `ต้องไม่เกิน ${USAGE_MAX.toLocaleString('th-TH')}`

    usageLastDone = parseOneDecimal(input.usageLastDone)
    if (usageLastDone === null) errors.usageLastDone = 'กรอกค่าที่ทำครั้งล่าสุดเป็นตัวเลข'
    else if (usageLastDone > USAGE_MAX) errors.usageLastDone = `ต้องไม่เกิน ${USAGE_MAX.toLocaleString('th-TH')}`

    usageCurrent = parseOneDecimal(input.usageCurrent)
    if (usageCurrent === null) errors.usageCurrent = 'กรอกค่าปัจจุบันเป็นตัวเลข'
    else if (usageCurrent > USAGE_MAX) errors.usageCurrent = `ต้องไม่เกิน ${USAGE_MAX.toLocaleString('th-TH')}`
    else if (usageLastDone !== null && usageCurrent < usageLastDone) errors.usageCurrent = 'ค่าปัจจุบันต้องไม่น้อยกว่าค่าที่ทำครั้งล่าสุด'
  }

  if (Object.keys(errors).length > 0) return { errors, values: null }

  return {
    errors,
    values: {
      category: input.category,
      name,
      due_date: input.dueDate,
      repeat_every: repeatEvery,
      repeat_unit: repeatEvery === null ? null : input.repeatUnit,
      remind_before_days: remindDays,
      cost,
      provider_name: trimmedOrNull(input.providerName),
      provider_phone: trimmedOrNull(input.providerPhone),
      note: trimmedOrNull(input.note),
      usage_unit: usageUnit,
      usage_interval: usageInterval,
      usage_last_done: usageLastDone,
      usage_current: usageCurrent,
    },
  }
}

/** ตรวจ Form "ทำแล้ว"; ค่าระยะที่เว้นว่างจะใช้ค่าปัจจุบันของรายการ */
export function validateComplete(input: CompleteFormInput, item: ReminderItem): CompleteValidation {
  const errors: CompleteFieldErrors = {}

  if (!isValidISODate(input.doneOn)) errors.doneOn = 'กรุณาเลือกวันที่ทำ'

  let cost: number | null = null
  if (input.cost.trim() !== '') {
    cost = parseMoney(input.cost)
    if (cost === null) errors.cost = 'กรอกค่าใช้จ่ายเป็นตัวเลข ทศนิยมไม่เกิน 2 ตำแหน่ง'
    else if (cost > COST_MAX) errors.cost = `ค่าใช้จ่ายต้องไม่เกิน ${COST_MAX.toLocaleString('th-TH')}`
  }

  if (input.providerName.trim().length > PROVIDER_NAME_MAX_LENGTH) errors.providerName = `ต้องไม่เกิน ${PROVIDER_NAME_MAX_LENGTH} ตัวอักษร`
  if (input.providerPhone.trim().length > PROVIDER_PHONE_MAX_LENGTH) errors.providerPhone = `ต้องไม่เกิน ${PROVIDER_PHONE_MAX_LENGTH} ตัวอักษร`
  if (input.note.trim().length > NOTE_MAX_LENGTH) errors.note = `หมายเหตุต้องไม่เกิน ${NOTE_MAX_LENGTH} ตัวอักษร`

  let usageValue: number | null = null
  if (item.usage_unit !== null) {
    if (input.usageValue.trim() === '') usageValue = item.usage_current
    else {
      usageValue = parseOneDecimal(input.usageValue)
      if (usageValue === null) errors.usageValue = 'กรอกค่าระยะเป็นตัวเลข'
      else if (usageValue > USAGE_MAX) errors.usageValue = `ต้องไม่เกิน ${USAGE_MAX.toLocaleString('th-TH')}`
    }
  }

  let nextDue: string | null = null
  if (input.nextDue.trim() !== '') {
    if (!isValidISODate(input.nextDue)) errors.nextDue = 'วันที่ไม่ถูกต้อง'
    else if (isValidISODate(input.doneOn) && input.nextDue <= input.doneOn) errors.nextDue = 'วันครบกำหนดครั้งถัดไปต้องอยู่หลังวันที่ทำ'
    else nextDue = input.nextDue
  }

  if (Object.keys(errors).length > 0) return { errors, values: null }

  return {
    errors,
    values: {
      done_on: input.doneOn,
      cost,
      provider_name: trimmedOrNull(input.providerName),
      provider_phone: trimmedOrNull(input.providerPhone),
      note: trimmedOrNull(input.note),
      usage_value: usageValue,
      next_due: nextDue,
    },
  }
}
