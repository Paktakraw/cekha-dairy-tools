import { EmptyState } from '../shared/components/ui'

/** โครงเตรียมไว้สำหรับ Login จริงในอนาคต (ยังไม่มี UI Login ใน V1) */
export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md p-6">
      <EmptyState title="ยังไม่เปิดใช้งานระบบเข้าสู่ระบบ" description="เวอร์ชันนี้ใช้งานแบบไม่ระบุตัวตนโดยอัตโนมัติ" />
    </div>
  )
}
