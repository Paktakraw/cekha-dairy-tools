import { Navigate, Outlet } from 'react-router-dom'
import { LOGIN_PATH } from '../shared/constants/routes'
import { useAuth } from '../shared/hooks/useAuth'
import { AuthStatusGate } from './AuthStatusGate'

/** ครอบ route ที่ต้องล็อกอิน — ยังไม่ล็อกอินให้ไปหน้าเข้าสู่ระบบ */
export function ProtectedRoute() {
  const { user } = useAuth()

  return <AuthStatusGate>{user ? <Outlet /> : <Navigate to={LOGIN_PATH} replace />}</AuthStatusGate>
}
