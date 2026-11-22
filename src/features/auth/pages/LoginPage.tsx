import { LogIn } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button, Input } from '../../../shared/components/ui'
import { REGISTER_PATH } from '../../../shared/constants/routes'
import { AuthCard } from '../components/AuthCard'
import { useLogin } from '../hooks/useLogin'

export default function LoginPage() {
  const { values, errors, formError, submitting, setField, submit } = useLogin()

  return (
    <AuthCard
      title="เข้าสู่ระบบ"
      footer={
        <>
          ยังไม่มีบัญชี?{' '}
          <Link to={REGISTER_PATH} className="font-medium text-gray-900 underline">
            สมัครสมาชิก
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Input
          label="ชื่อผู้ใช้"
          value={values.username}
          onChange={(e) => setField('username', e.target.value)}
          error={errors.username}
          autoComplete="username"
          autoCapitalize="none"
          autoFocus
        />
        <Input
          label="รหัสผ่าน"
          type="password"
          value={values.password}
          onChange={(e) => setField('password', e.target.value)}
          error={errors.password}
          autoComplete="current-password"
        />
        {formError && (
          <p role="alert" className="text-sm text-red-700">
            {formError}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={submitting}>
          <LogIn className="h-4 w-4" />
          {submitting ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </Button>
      </form>
    </AuthCard>
  )
}
