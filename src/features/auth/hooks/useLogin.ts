import { useState, type FormEvent } from 'react'
import { authService } from '../services/authService'
import type { LoginErrors, LoginInput } from '../types/auth'
import { normalizeUsername, validateLogin } from '../utils/auth'

const EMPTY: LoginInput = { username: '', password: '' }

/** state + logic ของหน้าเข้าสู่ระบบ — สำเร็จแล้ว AuthProvider รับ session และ route พาไปหน้าแรกเอง */
export function useLogin() {
  const [values, setValues] = useState<LoginInput>(EMPTY)
  const [errors, setErrors] = useState<LoginErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const setField = (field: keyof LoginInput, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
    setFormError(null)
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (submitting) return
    const found = validateLogin(values)
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setSubmitting(true)
    setFormError(null)
    try {
      const result = await authService.signIn({ username: normalizeUsername(values.username), password: values.password })
      if (result.error !== null) setFormError(result.error)
    } catch (cause) {
      console.error('[useLogin] เข้าสู่ระบบ:', cause)
      setFormError('เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่')
    } finally {
      setSubmitting(false)
    }
  }

  return { values, errors, formError, submitting, setField, submit }
}
