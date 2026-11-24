import { ArrowRight, RefreshCw } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { TodayWidgetProps } from '../../types/feature'

interface WidgetFrameProps extends TodayWidgetProps {
  loading: boolean
  error: string | null
  onRetry: () => void
  /** ลิงก์ที่กดการ์ดแล้วไป (ไม่ระบุ = path ของฟีเจอร์) */
  to?: string
  children: ReactNode
}

/** กรอบการ์ดภาพรวมวันนี้: หัวการ์ด + ลิงก์ไปฟีเจอร์ + สถานะโหลด/ผิดพลาด (การ์ดทุกใบใช้ร่วมกัน) */
export function WidgetFrame({ name, icon: Icon, path, to, loading, error, onRetry, children }: WidgetFrameProps) {
  const header = (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 shrink-0 text-gray-800" aria-hidden="true" />
      <h3 className="text-sm font-medium text-gray-900">{name}</h3>
    </div>
  )

  if (error !== null) {
    return (
      <section className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
        {header}
        <p className="text-sm text-gray-500">โหลดข้อมูลไม่สำเร็จ</p>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1 self-start text-sm text-gray-700 underline hover:text-gray-900"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          ลองใหม่
        </button>
      </section>
    )
  }

  return (
    <Link
      to={to ?? path}
      className="group flex flex-col gap-2 rounded-lg border border-gray-200 bg-gray-50 p-4 transition-colors hover:border-gray-400 hover:bg-white"
    >
      {header}
      {loading ? (
        <div className="space-y-2" role="status" aria-label="กำลังโหลด">
          <div className="h-5 w-2/3 animate-pulse rounded bg-gray-200" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
        </div>
      ) : (
        <div className="flex-1">{children}</div>
      )}
      <ArrowRight className="h-4 w-4 self-end text-gray-400 group-hover:text-gray-900" aria-hidden="true" />
    </Link>
  )
}

/** ข้อความหลักของการ์ด (ตัวเลข/ข้อความเด่น) */
export function WidgetValue({ children }: { children: ReactNode }) {
  return <p className="text-lg font-semibold text-gray-900">{children}</p>
}

/** ข้อความรองของการ์ด */
export function WidgetNote({ children }: { children: ReactNode }) {
  return <p className="mt-0.5 text-xs text-gray-500">{children}</p>
}
