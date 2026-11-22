import { Navigate, Outlet } from 'react-router-dom'
import { HOME_PATH } from '../shared/constants/routes'
import { useAuth } from '../shared/hooks/useAuth'
import { AuthStatusGate } from './AuthStatusGate'

/** ครอบหน้าเข้าสู่ระบบ/สมัครสมาชิก — ถ้าล็อกอินอยู่แล้วให้กลับหน้าแรก */
export function PublicOnlyRoute() {
  const { user } = useAuth()

  return <AuthStatusGate>{user ? <Navigate to={HOME_PATH} replace /> : <Outlet />}</AuthStatusGate>
}
