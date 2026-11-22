import type { ReactNode } from 'react'

/** กรอบกลางจอของหน้าเข้าสู่ระบบ/สมัครสมาชิก (หน้าสาธารณะ ไม่มี Sidebar) */
export function AuthCard({ title, children, footer }: { title: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md">
        <p className="mb-4 text-center text-sm font-semibold text-gray-500">เสขาประจำวัน</p>
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="mb-4 text-lg font-semibold text-gray-900">{title}</h1>
          {children}
        </div>
        <p className="mt-4 text-center text-sm text-gray-600">{footer}</p>
      </div>
    </div>
  )
}
