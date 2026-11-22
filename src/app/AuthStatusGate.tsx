import type { ReactNode } from 'react'
import { useAuth } from '../shared/hooks/useAuth'
import { ErrorState, Spinner } from '../shared/components/ui'

/** รอผลตรวจ session: แสดง Spinner ขณะโหลด และ Error พร้อมปุ่มลองใหม่ ก่อนให้ route guard ตัดสินใจต่อ */
export function AuthStatusGate({ children }: { children: ReactNode }) {
  const { loading, error, retry } = useAuth()

  if (loading) return <Spinner label="กำลังตรวจสอบการเข้าสู่ระบบ..." />

  if (error) {
    return (
      <div className="mx-auto max-w-md p-6">
        <ErrorState title="เริ่มต้นระบบไม่สำเร็จ" description={error} onRetry={retry} />
      </div>
    )
  }

  return <>{children}</>
}
