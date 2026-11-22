import { UserPlus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button, Input } from '../../../shared/components/ui'
import { LOGIN_PATH } from '../../../shared/constants/routes'
import { AuthCard } from '../components/AuthCard'
import { useRegister } from '../hooks/useRegister'
import { EMAIL_MAX, NAME_MAX, USERNAME_MAX } from '../utils/auth'

export default function RegisterPage() {
  const { values, errors, formError, submitting, setField, submit } = useRegister()

  return (
    <AuthCard
      title="สมัครสมาชิก"
      footer={
        <>
          มีบัญชีอยู่แล้ว?{' '}
          <Link to={LOGIN_PATH} className="font-medium text-gray-900 underline">
            เข้าสู่ระบบ
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="ชื่อจริง"
            value={values.firstName}
            onChange={(e) => setField('firstName', e.target.value)}
            error={errors.firstName}
            maxLength={NAME_MAX}
            autoComplete="given-name"
            autoFocus
          />
          <Input
            label="นามสกุล"
            value={values.lastName}
            onChange={(e) => setField('lastName', e.target.value)}
            error={errors.lastName}
            maxLength={NAME_MAX}
            autoComplete="family-name"
          />
        </div>
        <Input
          label="ชื่อผู้ใช้"
          hint="3–30 ตัว ใช้ a-z, 0-9, _ และ . — เป็นชื่อที่แสดงในระบบและใช้เข้าสู่ระบบ"
          value={values.username}
          onChange={(e) => setField('username', e.target.value)}
          error={errors.username}
          maxLength={USERNAME_MAX}
          autoComplete="username"
          autoCapitalize="none"
        />
        <Input
          label="อีเมล"
          type="email"
          value={values.email}
          onChange={(e) => setField('email', e.target.value)}
          error={errors.email}
          maxLength={EMAIL_MAX}
          autoComplete="email"
        />
        <Input
          label="เบอร์โทร"
          type="tel"
          inputMode="numeric"
          hint="ตัวเลข 10 หลัก เช่น 0812345678"
          value={values.phone}
          onChange={(e) => setField('phone', e.target.value)}
          error={errors.phone}
          autoComplete="tel"
        />
        <Input
          label="รหัสผ่าน"
          type="password"
          hint="อย่างน้อย 8 ตัวอักษร — ระบบยังไม่มีการรีเซ็ตรหัสผ่าน โปรดจดไว้ให้ดี"
          value={values.password}
          onChange={(e) => setField('password', e.target.value)}
          error={errors.password}
          autoComplete="new-password"
        />
        <Input
          label="ยืนยันรหัสผ่าน"
          type="password"
          value={values.confirmPassword}
          onChange={(e) => setField('confirmPassword', e.target.value)}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />
        {formError && (
          <p role="alert" className="text-sm text-red-700">
            {formError}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={submitting}>
          <UserPlus className="h-4 w-4" />
          {submitting ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
        </Button>
      </form>
    </AuthCard>
  )
}
