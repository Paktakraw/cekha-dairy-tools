import { BarChart3, Calculator, Settings, Utensils } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { PageHeader } from '../../../shared/components/layout/PageHeader'

/** เมนูหลัก (ใช้งานจริง) — ปุ่มเล็กพอให้ทั้ง 3 ปุ่มอยู่ในจอมือถือโดยไม่ต้องเลื่อนซ้ายขวา */
const MAIN_TABS = [
  { to: 'food', label: 'บันทึกอาหาร', icon: Utensils },
  { to: 'summary', label: 'สรุป', icon: BarChart3 },
  { to: 'bmr', label: 'BMR/TDEE', icon: Calculator },
]

/** โครงของฟีเจอร์แคลอรี่: Header + เมนูย่อย (sticky) แล้วแสดงหน้าย่อยด้วย Outlet */
export default function CalorieLayout() {
  return (
    <>
      <PageHeader maxWidth="max-w-4xl">
        <h1 className="text-xl font-semibold text-gray-900">ผอมไปด้วยกัน</h1>
        <nav className="mt-2 flex items-center gap-1.5" aria-label="เมนูย่อยผอมไปด้วยกัน">
          {MAIN_TABS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs whitespace-nowrap transition-colors sm:gap-2 sm:px-3 sm:py-1.5 sm:text-sm ${
                  isActive
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {label}
            </NavLink>
          ))}

          {/* หน้าตั้งค่ารายการอาหาร: ไม่ใช่ปุ่มใช้งานประจำ จึงอยู่ท้ายสุด ไม่มีกรอบ สีจาง (มือถือแสดงเฉพาะไอคอน) */}
          <NavLink
            to="foods"
            title="รายการอาหาร (ตั้งค่า)"
            aria-label="รายการอาหาร (ตั้งค่า)"
            className={({ isActive }) =>
              `ml-auto inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs whitespace-nowrap transition-colors sm:text-sm ${
                isActive ? 'bg-gray-100 font-medium text-gray-900' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">รายการอาหาร</span>
          </NavLink>
        </nav>
      </PageHeader>
      <div className="mx-auto mt-4 max-w-4xl">
        <Outlet />
      </div>
    </>
  )
}
