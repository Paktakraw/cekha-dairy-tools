import { useState } from 'react'
import { ArrowLeftRight, NotebookPen, Users } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { PageHeader } from '../../../shared/components/layout/PageHeader'
import { ErrorState, Spinner } from '../../../shared/components/ui'
import type { SizeContext } from '../hooks/useSizeContext'
import { useSizeProfiles } from '../hooks/useSizeProfiles'

const TABS = [
  { to: 'converter', label: 'ตัวแปลง', icon: ArrowLeftRight },
  { to: 'profiles', label: 'โปรไฟล์', icon: Users },
  { to: 'notes', label: 'จดไซส์', icon: NotebookPen },
]

/** โครงของฟีเจอร์: Header + เมนูย่อย แล้วแสดงหน้าย่อยด้วย Outlet โหลดโปรไฟล์ครั้งเดียวและแชร์ให้ทุกหน้า */
export default function SizeConverterLayout() {
  const state = useSizeProfiles()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // เลือกอยู่ที่ถูกลบไปแล้ว/ยังไม่เลือก -> โปรไฟล์ "ฉัน" หรืออันแรก
  const selected = state.profiles.find((p) => p.id === selectedId) ?? state.profiles.find((p) => p.is_self) ?? state.profiles[0] ?? null
  const context: SizeContext = { ...state, selected, selectProfile: setSelectedId }

  return (
    <>
      <PageHeader maxWidth="max-w-4xl">
        <h1 className="text-xl font-semibold text-gray-900">ไซส์ไหนคือฉัน</h1>
        <nav className="mt-2 flex gap-2 overflow-x-auto" aria-label="เมนูย่อยไซส์ไหนคือฉัน">
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
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </PageHeader>
      <div className="mx-auto mt-4 max-w-4xl">
        {state.firstLoad && state.loading ? (
          <Spinner />
        ) : state.error ? (
          <ErrorState title="โหลดโปรไฟล์ไม่สำเร็จ" description={state.error} onRetry={state.reload} />
        ) : (
          <Outlet context={context} />
        )}
      </div>
    </>
  )
}
