import { RefreshCw } from 'lucide-react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../shared/hooks/useAuth'
import { Button, EmptyState, Spinner } from '../shared/components/ui'

/** ครอบ route ที่ต้องมี user — ตอนนี้ user มาจาก anonymous sign-in อัตโนมัติ */
export function ProtectedRoute() {
  const { user, loading, error, retry } = useAuth()

  if (loading) return <Spinner label="กำลังเข้าสู่ระบบ..." />

  if (error) {
    return (
      <div className="mx-auto max-w-md p-6">
        <EmptyState
          title="เริ่มต้นระบบไม่สำเร็จ"
          description={error}
          action={
            <Button variant="secondary" onClick={retry}>
              <RefreshCw className="h-4 w-4" />
              ลองใหม่
            </Button>
          }
        />
      </div>
    )
  }

  // อนาคต: เมื่อเลิกใช้ anonymous จะ redirect ไปหน้า Login
  if (!user) return <Navigate to="/login" replace />

  return <Outlet />
}
