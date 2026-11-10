import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../shared/hooks/useAuth'
import { ErrorState, Spinner } from '../shared/components/ui'

/** ครอบ route ที่ต้องมี user — ตอนนี้ user มาจาก anonymous sign-in อัตโนมัติ */
export function ProtectedRoute() {
  const { user, loading, error, retry } = useAuth()

  if (loading) return <Spinner label="กำลังเข้าสู่ระบบ..." />

  if (error) {
    return (
      <div className="mx-auto max-w-md p-6">
        <ErrorState title="เริ่มต้นระบบไม่สำเร็จ" description={error} onRetry={retry} />
      </div>
    )
  }

  // อนาคต: เมื่อเลิกใช้ anonymous จะ redirect ไปหน้า Login
  if (!user) return <Navigate to="/login" replace />

  return <Outlet />
}
