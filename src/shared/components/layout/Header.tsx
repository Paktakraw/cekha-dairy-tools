import { Home, Menu } from 'lucide-react'
import { Link } from 'react-router-dom'
import { IconButton } from '../ui'

/** แถบด้านบนสำหรับมือถือ/แท็บเล็ต (ซ่อนที่ lg ขึ้นไป) ติดอยู่กับที่ เปิดเมนูได้ตลอด และกลับหน้าหลักได้ในปุ่มเดียว */
export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-gray-200 bg-white px-4 lg:hidden">
      <IconButton icon={Menu} label="เปิดเมนู" onClick={onMenuClick} />
      <span className="font-semibold text-gray-900">เสขาประจำวัน</span>
      <Link
        to="/"
        title="หน้าหลัก"
        aria-label="หน้าหลัก"
        className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-600 transition-colors hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-gray-900"
      >
        <Home className="h-4 w-4" />
      </Link>
    </header>
  )
}
