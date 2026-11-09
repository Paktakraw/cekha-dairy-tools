import { EmptyState } from '../shared/components/ui'

/** โครงเตรียมไว้สำหรับ Login จริงในอนาคต (ยังไม่มี UI Login ใน V1) */
export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md p-6">
      <EmptyState title="ยังไม่เปิดใช้งานระบบ Login" description="เวอร์ชันนี้ใช้งานแบบ anonymous อัตโนมัติ" />
    </div>
  )
}
