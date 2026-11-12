import type { ResultUnit, UnitGroup, UnitId } from '../types/unitPrice'

interface UnitDefinition {
  /** ชื่อเต็ม */
  label: string
  /** ชื่อย่อ (ใช้ใน dropdown ที่พื้นที่แคบ) */
  short: string
  group: UnitGroup
  /** 1 หน่วยนี้ = กี่หน่วยฐาน (กรัม / มิลลิลิตร / ชิ้น) */
  toBase: number
}

export const UNITS: Record<UnitId, UnitDefinition> = {
  mg: { label: 'มิลลิกรัม (มก.)', short: 'มก.', group: 'weight', toBase: 0.001 },
  g: { label: 'กรัม (ก.)', short: 'ก.', group: 'weight', toBase: 1 },
  kg: { label: 'กิโลกรัม (กก.)', short: 'กก.', group: 'weight', toBase: 1000 },
  ml: { label: 'มิลลิลิตร (มล.)', short: 'มล.', group: 'volume', toBase: 1 },
  l: { label: 'ลิตร (ล.)', short: 'ล.', group: 'volume', toBase: 1000 },
  piece: { label: 'ชิ้น', short: 'ชิ้น', group: 'count', toBase: 1 },
}

export const UNIT_GROUP_ORDER: UnitGroup[] = ['weight', 'volume', 'count']

export function unitsOfGroup(group: UnitGroup): UnitId[] {
  return (Object.keys(UNITS) as UnitId[]).filter((id) => UNITS[id].group === group)
}

/** หน่วยผลลัพธ์ที่เลือกได้ของแต่ละกลุ่ม (ตัวแรกที่ isDefault = ค่าเริ่มต้น) */
export const RESULT_UNITS: Record<UnitGroup, ResultUnit[]> = {
  weight: [
    { id: 'per-1g', label: '1 กรัม', size: 1 },
    { id: 'per-100g', label: '100 กรัม', size: 100 },
    { id: 'per-1kg', label: '1 กิโลกรัม', size: 1000 },
  ],
  volume: [
    { id: 'per-1ml', label: '1 มิลลิลิตร', size: 1 },
    { id: 'per-100ml', label: '100 มิลลิลิตร', size: 100 },
    { id: 'per-1l', label: '1 ลิตร', size: 1000 },
  ],
  count: [{ id: 'per-1piece', label: '1 ชิ้น', size: 1 }],
}

export const DEFAULT_RESULT_UNIT_ID: Record<UnitGroup, string> = {
  weight: 'per-100g',
  volume: 'per-100ml',
  count: 'per-1piece',
}

export function findResultUnit(group: UnitGroup, id: string): ResultUnit {
  const units = RESULT_UNITS[group]
  return units.find((u) => u.id === id) ?? units.find((u) => u.id === DEFAULT_RESULT_UNIT_ID[group]) ?? units[0]
}
