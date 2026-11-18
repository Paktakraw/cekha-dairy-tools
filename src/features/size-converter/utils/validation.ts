import {
  BRAND_MAX_LENGTH,
  MEASURE_FIELDS,
  NAME_MAX_LENGTH,
  NOTE_MAX_LENGTH,
  PRODUCT_MAX_LENGTH,
  SIZE_LABEL_MAX_LENGTH,
} from '../constants.ts'
import type {
  MeasureErrors,
  MeasureInput,
  MeasureKey,
  Measurements,
  NoteFieldErrors,
  NoteFormInput,
  NoteValues,
  ProfileFieldErrors,
  ProfileFormInput,
  ProfileValues,
  SizeProfile,
  UnitPref,
} from '../types/size'
import { cmToInch, inchToCm, round1 } from './units.ts'

const NUMBER_PATTERN = /^\d+(\.\d+)?$/

export const EMPTY_MEASURE_INPUT: MeasureInput = {
  height_cm: '',
  foot_length_cm: '',
  foot_width_cm: '',
  chest_cm: '',
  waist_cm: '',
  hip_cm: '',
  head_cm: '',
  finger_circumference_mm: '',
}

export const EMPTY_MEASUREMENTS: Measurements = {
  height_cm: null,
  foot_length_cm: null,
  foot_width_cm: null,
  chest_cm: null,
  waist_cm: null,
  hip_cm: null,
  head_cm: null,
  finger_circumference_mm: null,
}

/** ค่าที่เก็บ (cm/mm) -> ข้อความในช่องกรอกตามหน่วยที่เลือก */
export function measuresToInput(measures: Measurements, unit: UnitPref): MeasureInput {
  const input = { ...EMPTY_MEASURE_INPUT }
  for (const field of MEASURE_FIELDS) {
    const value = measures[field.key]
    if (value === null) continue
    input[field.key] = String(field.unit === 'length' && unit === 'inch' ? cmToInch(value) : value)
  }
  return input
}

/** แปลงข้อความในช่องกรอกเป็นสัดส่วน cm/mm พร้อมตรวจช่วงที่รับ (ช่องว่าง = ไม่ทราบ) */
export function parseMeasures(input: MeasureInput, unit: UnitPref): { errors: MeasureErrors; values: Measurements | null } {
  const errors: MeasureErrors = {}
  const values: Measurements = { ...EMPTY_MEASUREMENTS }

  for (const field of MEASURE_FIELDS) {
    const text = input[field.key].trim()
    if (text === '') continue
    if (!NUMBER_PATTERN.test(text)) {
      errors[field.key] = 'กรอกเป็นตัวเลข'
      continue
    }
    const raw = Number(text)
    const useInch = field.unit === 'length' && unit === 'inch'
    const stored = round1(useInch ? inchToCm(raw) : raw)
    if (stored < field.min || stored > field.max) {
      const range = useInch ? `${cmToInch(field.min)}–${cmToInch(field.max)} นิ้ว` : `${field.min}–${field.max} ${field.unit === 'mm' ? 'mm' : 'cm'}`
      errors[field.key] = `ต้องอยู่ระหว่าง ${range}`
      continue
    }
    values[field.key] = stored
  }

  return Object.keys(errors).length > 0 ? { errors, values: null } : { errors, values }
}

export function profileToFormInput(profile: SizeProfile): ProfileFormInput {
  return {
    name: profile.name,
    demographic: profile.demographic,
    unit: profile.unit_pref,
    measures: measuresToInput(profile, profile.unit_pref),
  }
}

export function validateProfile(input: ProfileFormInput): { errors: ProfileFieldErrors; values: ProfileValues | null } {
  const errors: ProfileFieldErrors = {}
  const name = input.name.trim()
  if (name === '') errors.name = 'กรอกชื่อโปรไฟล์'
  else if (name.length > NAME_MAX_LENGTH) errors.name = `ไม่เกิน ${NAME_MAX_LENGTH} ตัวอักษร`

  const parsed = parseMeasures(input.measures, input.unit)
  Object.assign(errors, parsed.errors)
  if (Object.keys(errors).length > 0 || parsed.values === null) return { errors, values: null }

  return { errors, values: { name, demographic: input.demographic, unit_pref: input.unit, ...parsed.values } }
}

export function isMeasureKey(key: string): key is MeasureKey {
  return MEASURE_FIELDS.some((f) => f.key === key)
}

export function validateNote(input: NoteFormInput, profileId: string): { errors: NoteFieldErrors; values: NoteValues | null } {
  const errors: NoteFieldErrors = {}
  const brand = input.brand.trim()
  const product = input.product.trim()
  const sizeLabel = input.sizeLabel.trim()
  const note = input.note.trim()

  if (brand === '') errors.brand = 'กรอกชื่อแบรนด์'
  else if (brand.length > BRAND_MAX_LENGTH) errors.brand = `ไม่เกิน ${BRAND_MAX_LENGTH} ตัวอักษร`
  if (product.length > PRODUCT_MAX_LENGTH) errors.product = `ไม่เกิน ${PRODUCT_MAX_LENGTH} ตัวอักษร`
  if (sizeLabel === '') errors.sizeLabel = 'กรอกไซส์ที่ใส่'
  else if (sizeLabel.length > SIZE_LABEL_MAX_LENGTH) errors.sizeLabel = `ไม่เกิน ${SIZE_LABEL_MAX_LENGTH} ตัวอักษร`
  if (note.length > NOTE_MAX_LENGTH) errors.note = `ไม่เกิน ${NOTE_MAX_LENGTH} ตัวอักษร`

  if (Object.keys(errors).length > 0) return { errors, values: null }
  return {
    errors,
    values: {
      profile_id: profileId,
      brand,
      product: product === '' ? null : product,
      size_label: sizeLabel,
      fit: input.fit,
      note: note === '' ? null : note,
    },
  }
}
