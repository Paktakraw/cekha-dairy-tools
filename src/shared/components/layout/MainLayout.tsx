import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import type { FeatureConfig } from '../../types/feature'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

const COLLAPSED_STORAGE_KEY = 'sidebar-collapsed'

/** ค่าเริ่มต้น = ย่อไว้ ถ้าผู้ใช้เคยเลือกไว้จะใช้ค่านั้น (localStorage อาจใช้ไม่ได้ จึงครอบด้วย try/catch) */
function readCollapsed(): boolean {
  try {
    const saved = window.localStorage.getItem(COLLAPSED_STORAGE_KEY)
    return saved === null ? true : saved === 'true'
  } catch {
    return true
  }
}

function saveCollapsed(collapsed: boolean): void {
  try {
    window.localStorage.setItem(COLLAPSED_STORAGE_KEY, String(collapsed))
  } catch {
    // ไม่เป็นไร: แค่จำค่าข้ามการรีเฟรชไม่ได้
  }
}

/**
 * Breakpoint ของ layout:
 * - ต่ำกว่า lg (มือถือ/แท็บเล็ต): Sidebar เป็น drawer เปิดจากปุ่มเมนูบนแถบ Header
 * - lg ขึ้นไป (คอม): Sidebar ติดอยู่กับที่ ไม่เลื่อนตามเนื้อหา และย่อเป็นแถบไอคอนได้
 */
export function MainLayout({ features }: { features: FeatureConfig[] }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(readCollapsed)

  const toggleCollapsed = () => {
    const next = !collapsed
    setCollapsed(next)
    saveCollapsed(next)
  }

  return (
    <div className="flex min-h-dvh bg-white text-gray-900">
      <Sidebar
        features={features}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapsed}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header onMenuClick={() => setMenuOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
