import { MAX_OPTIONS, NAME_MAX_LENGTH, PRICE_MAX, QUANTITY_MAX, TIE_TOLERANCE } from '../constants.ts'
import type { ComparedOption, ComparisonResult, OptionInput, OptionValidation, ResultUnit } from '../types/unitPrice.ts'
import { UNITS } from './units.ts'

const PRICE_PATTERN = /^\d+(\.\d{0,2})?$/
const QUANTITY_PATTERN = /^\d+(\.\d{0,6})?$/

function cleanNumberText(text: string): string {
  return text.trim().replace(/,/g, '')
}

/** ตรวจ 1 ตัวเลือก: ช่องว่างทั้งคู่ = ยังไม่กรอก, กรอกแค่ช่องเดียวหรือผิดรูปแบบ = มี error */
export function validateOption(option: OptionInput): OptionValidation {
  const priceText = cleanNumberText(option.price)
  const quantityText = cleanNumberText(option.quantity)
  const errors: OptionValidation['errors'] = {}

  if (option.name.trim().length > NAME_MAX_LENGTH) {
    errors.name = `ชื่อต้องไม่เกิน ${NAME_MAX_LENGTH} ตัวอักษร`
  }

  const blank = priceText === '' && quantityText === ''
  if (blank) return { blank: true, errors, values: null }

  let price: number | null = null
  if (priceText === '') errors.price = 'กรุณากรอกราคา'
  else if (!PRICE_PATTERN.test(priceText)) errors.price = 'กรอกตัวเลข ทศนิยมไม่เกิน 2 ตำแหน่ง'
  else {
    price = Number(priceText)
    if (price <= 0) errors.price = 'ราคาต้องมากกว่า 0'
    else if (price > PRICE_MAX) errors.price = `ราคาต้องไม่เกิน ${PRICE_MAX.toLocaleString('th-TH')}`
  }

  let quantity: number | null = null
  if (quantityText === '') errors.quantity = 'กรุณากรอกปริมาณ'
  else if (!QUANTITY_PATTERN.test(quantityText)) errors.quantity = 'กรอกเป็นตัวเลข'
  else {
    quantity = Number(quantityText)
    if (quantity <= 0) errors.quantity = 'ปริมาณต้องมากกว่า 0'
    else if (quantity > QUANTITY_MAX) errors.quantity = `ปริมาณต้องไม่เกิน ${QUANTITY_MAX.toLocaleString('th-TH')}`
  }

  const hasError = !!errors.name || !!errors.price || !!errors.quantity
  if (hasError || price === null || quantity === null) return { blank: false, errors, values: null }
  return { blank: false, errors, values: { price, quantity } }
}

/** ราคาต่อ 1 หน่วยฐาน (กรัม / มิลลิลิตร / ชิ้น) */
export function pricePerBaseUnit(price: number, quantity: number, unit: OptionInput['unit']): number {
  return price / (quantity * UNITS[unit].toBase)
}

/** เทียบทุกตัวเลือกที่กรอกครบและถูกต้อง */
export function compareOptions(options: OptionInput[]): ComparisonResult {
  const valid = options.slice(0, MAX_OPTIONS).flatMap((option) => {
    const { values } = validateOption(option)
    if (values === null) return []
    return [{ id: option.id, group: UNITS[option.unit].group, pricePerBase: pricePerBaseUnit(values.price, values.quantity, option.unit) }]
  })

  if (valid.length < 2) return { status: 'not-enough', validCount: valid.length }

  const group = valid[0].group
  if (valid.some((o) => o.group !== group)) return { status: 'mixed-groups' }

  const cheapest = Math.min(...valid.map((o) => o.pricePerBase))
  const items: ComparedOption[] = valid.map((o) => {
    const isCheapest = o.pricePerBase - cheapest <= cheapest * TIE_TOLERANCE
    return {
      ...o,
      isCheapest,
      percentMore: isCheapest ? 0 : (o.pricePerBase / cheapest - 1) * 100,
    }
  })

  return { status: 'ok', group, items, allEqual: items.every((i) => i.isCheapest) }
}

/** ราคาต่อหน่วยผลลัพธ์ที่ผู้ใช้เลือก เช่น ต่อ 100 กรัม */
export function pricePerResultUnit(pricePerBase: number, unit: ResultUnit): number {
  return pricePerBase * unit.size
}
