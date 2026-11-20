import { CalendarDays, ChartPie, Settings, Smile } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { PageHeader } from '../../../shared/components/layout/PageHeader'
import { ErrorState, Spinner } from '../../../shared/components/ui'
import { useMoodTags } from '../hooks/useMoodTags'

const TABS = [
  { to: 'today', label: 'วันนี้', icon: Smile },
  { to: 'calendar', label: 'ปฏิทิน', icon: CalendarDays },
  { to: 'summary', label: 'สรุปเดือน', icon: ChartPie },
  { to: 'settings', label: 'ตั้งค่า', icon: Settings },
]

/** โครงของฟีเจอร์: Header + เมนูย่อย แล้วแสดงหน้าย่อยด้วย Outlet โหลดแท็กครั้งเดียวและแชร์ให้ทุกหน้า */
export default function MoodLayout() {
  const state = useMoodTags()
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
        {state.firstLoad && state.loading ? (
          <Spinner />
        ) : state.error ? (
          <ErrorState title="โหลดแท็กไม่สำเร็จ" description={state.error} onRetry={state.reload} />
        ) : (
          <Outlet context={state} />
        )}
      </div>
    </>
  )
}
