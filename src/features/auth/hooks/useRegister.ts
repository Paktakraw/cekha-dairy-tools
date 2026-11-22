import { useState, type FormEvent } from 'react'
import { authService } from '../services/authService'
import type { RegisterErrors, RegisterField, RegisterInput } from '../types/auth'
import { takenFieldsToErrors, validateRegister } from '../utils/auth'

const EMPTY: RegisterInput = {
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
}

/** state + logic ของหน้าสมัครสมาชิก: validate → ตรวจซ้ำ → สมัคร (สำเร็จแล้วถูกล็อกอินและ redirect ทันที) */
export function useRegister() {
  const [values, setValues] = useState<RegisterInput>(EMPTY)
  const [errors, setErrors] = useState<RegisterErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const setField = (field: RegisterField, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
    setFormError(null)
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (submitting) return
    const found = validateRegister(values)
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setSubmitting(true)
    setFormError(null)
    try {
      const availability = await authService.checkAvailability(values)
      if (availability.error !== null) {
        setFormError(availability.error)
        return
      }
      const taken = takenFieldsToErrors(availability.data)
      if (Object.keys(taken).length > 0) {
        setErrors(taken)
        return
      }

      const result = await authService.signUp(values)
      if (result.error !== null) setFormError(result.error)
    } catch (cause) {
      console.error('[useRegister] สมัครสมาชิก:', cause)
      setFormError('สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่')
    } finally {
      setSubmitting(false)
    }
  }

  return { values, errors, formError, submitting, setField, submit }
}
