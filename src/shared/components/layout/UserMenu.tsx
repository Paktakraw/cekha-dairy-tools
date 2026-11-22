import { LogOut, UserRound } from 'lucide-react'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { ConfirmDialog, IconButton } from '../ui'

/**
 * ชื่อผู้ใช้ (= username) + ปุ่มออกจากระบบพร้อมกล่องยืนยัน
 * showName=false ใช้ตอน Sidebar ย่อ (เหลือแต่ปุ่มไอคอน)
 */
export function UserMenu({ showName = true, className = '' }: { showName?: boolean; className?: string }) {
  const { username, signOut } = useAuth()
  const toast = useToast()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    const message = await signOut()
    setLoading(false)
    if (message) {
      toast.error(message)
      return
    }
    setConfirming(false)
    toast.success('ออกจากระบบแล้ว')
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {showName && (
        <span className="flex min-w-0 items-center gap-1.5 text-sm text-gray-700" title={username ?? undefined}>
          <UserRound className="h-4 w-4 shrink-0" />
          <span className="max-w-32 truncate">{username ?? 'ผู้ใช้'}</span>
        </span>
      )}
      <IconButton icon={LogOut} label="ออกจากระบบ" onClick={() => setConfirming(true)} />
      {/* ใช้ portal เพราะ Sidebar มี transform ซึ่งทำให้ Dialog แบบ fixed ถูกจำกัดอยู่ในกรอบ Sidebar */}
      {createPortal(
        <ConfirmDialog
          open={confirming}
          title="ออกจากระบบ"
          message="ต้องการออกจากระบบใช่หรือไม่? ครั้งหน้าต้องเข้าสู่ระบบด้วยชื่อผู้ใช้และรหัสผ่านอีกครั้ง"
          confirmLabel="ออกจากระบบ"
          confirmIcon={LogOut}
          loading={loading}
          onConfirm={handleConfirm}
          onCancel={() => setConfirming(false)}
        />,
        document.body,
      )}
    </div>
  )
}
