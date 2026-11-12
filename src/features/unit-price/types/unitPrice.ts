export type UnitGroup = 'weight' | 'volume' | 'count'

export type UnitId = 'mg' | 'g' | 'kg' | 'ml' | 'l' | 'piece'

/** ค่าในฟอร์มของ 1 ตัวเลือก (เก็บเป็นข้อความตามที่ผู้ใช้พิมพ์) */
export interface OptionInput {
  id: string
  name: string
  price: string
  quantity: string
  unit: UnitId
}

/** ค่าที่ผ่านการตรวจแล้ว */
export interface OptionValues {
  price: number
  quantity: number
}

export interface OptionFieldErrors {
  name?: string
  price?: string
  quantity?: string
}

export interface OptionValidation {
  /** ช่องราคาและปริมาณว่างทั้งคู่ = ยังไม่ได้กรอก (ไม่ถือว่าผิด แต่ไม่นำไปเทียบ) */
  blank: boolean
  errors: OptionFieldErrors
  /** null เมื่อยังกรอกไม่ครบหรือไม่ถูกต้อง */
  values: OptionValues | null
}

export interface ComparedOption {
  id: string
  group: UnitGroup
  /** ราคาต่อ 1 หน่วยฐาน (กรัม / มิลลิลิตร / ชิ้น) */
  pricePerBase: number
  /** ถูกที่สุด (ราคาเท่ากันได้หลายตัว) */
  isCheapest: boolean
  /** แพงกว่าตัวที่ถูกที่สุดกี่ % (ตัวที่ถูกที่สุด = 0) */
  percentMore: number
}

export type ComparisonResult =
  | { status: 'not-enough'; validCount: number }
  | { status: 'mixed-groups' }
  | { status: 'ok'; group: UnitGroup; items: ComparedOption[]; allEqual: boolean }

export interface ResultUnit {
  id: string
  /** ข้อความแสดง เช่น "100 กรัม" */
  label: string
  /** ขนาดเป็นหน่วยฐาน เช่น 100 */
  size: number
}
