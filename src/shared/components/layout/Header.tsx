import { Home, Menu } from 'lucide-react'
import { Link } from 'react-router-dom'
import { IconButton } from '../ui'
import { ThemeToggle } from './ThemeToggle'

/**
 * แถบด้านบนสำหรับมือถือ/แท็บเล็ต (ซ่อนที่ lg ขึ้นไป) ตรึงที่ขอบบนของจอ (fixed) ไม่เลื่อนตามเนื้อหา
 * เปิดเมนูได้ตลอด และกลับหน้าหลักได้ในปุ่มเดียว (MainLayout เว้นที่ h-14 ไว้ให้เนื้อหาไม่ถูกบัง)
 */
export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="fixed inset-x-0 top-0 z-20 flex h-14 items-center gap-2 border-b border-gray-200 bg-white px-4 lg:hidden">
      <IconButton icon={Menu} label="เปิดเมนู" onClick={onMenuClick} />
      <span className="font-semibold text-gray-900">เสขาประจำวัน</span>
      <ThemeToggle className="ml-auto" />
      <Link
        to="/"
        title="หน้าหลัก"
        aria-label="หน้าหลัก"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-600 transition-colors hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-gray-900"
      >
        <Home className="h-4 w-4" />
      </Link>
    </header>
  )
}
