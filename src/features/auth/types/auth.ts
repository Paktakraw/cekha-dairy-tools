/** ค่าในฟอร์มสมัครสมาชิก (ทุกช่องเป็น string ตามที่ผู้ใช้พิมพ์) */
export interface RegisterInput {
  firstName: string
  lastName: string
  username: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}

export type RegisterField = keyof RegisterInput

export type RegisterErrors = Partial<Record<RegisterField, string>>

export interface LoginInput {
  username: string
  password: string
}

export type LoginErrors = Partial<Record<keyof LoginInput, string>>

/** ฟิลด์ที่ต้องไม่ซ้ำกันระหว่างผู้ใช้ */
export type UniqueField = 'username' | 'email' | 'phone'
