import { CalendarDays, ChartPie, Smile } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { PageHeader } from '../../../shared/components/layout/PageHeader'

const TABS = [
  { to: 'today', label: 'วันนี้', icon: Smile },
  { to: 'calendar', label: 'ปฏิทิน', icon: CalendarDays },
  { to: 'summary', label: 'สรุปเดือน', icon: ChartPie },
]

/** โครงของฟีเจอร์: Header + เมนูย่อย แล้วแสดงหน้าย่อยด้วย Outlet */
export default function MoodLayout() {
  return (
    <>
      <PageHeader maxWidth="max-w-2xl">
        <h1 className="text-xl font-semibold text-gray-900">ตัวฉันวันนี้</h1>
        <nav className="mt-2 flex flex-wrap gap-2" aria-label="เมนูย่อยตัวฉันวันนี้">
          {TABS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm whitespace-nowrap transition-colors ${
                  isActive ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
      </PageHeader>
      <div className="mx-auto mt-4 max-w-2xl">
        <Outlet />
      </div>
    </>
  )
}
