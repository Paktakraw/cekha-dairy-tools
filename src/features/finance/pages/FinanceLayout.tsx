import { ArrowLeftRight, BarChart3, Tags } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { PageHeader } from '../../../shared/components/layout/PageHeader'

const TABS = [
  { to: 'transactions', label: 'บันทึกรายการ', icon: ArrowLeftRight },
  { to: 'summary', label: 'สรุป', icon: BarChart3 },
  { to: 'categories', label: 'หมวดหมู่', icon: Tags },
]

/** โครงของฟีเจอร์ Finance: Header + เมนูย่อย 3 หน้า (sticky) แล้วแสดงหน้าย่อยด้วย Outlet */
export default function FinanceLayout() {
  return (
    <>
      <PageHeader maxWidth="max-w-4xl">
        <h1 className="text-xl font-semibold text-gray-900">รายรับ-รายจ่าย</h1>
        <nav className="mt-2 flex gap-2 overflow-x-auto" aria-label="เมนูย่อยรายรับ-รายจ่าย">
          {TABS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </PageHeader>
      <div className="mx-auto mt-4 max-w-4xl">
        <Outlet />
      </div>
    </>
  )
}
