import { useState } from 'react'
import { ArrowLeftRight, NotebookPen, Users } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
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
  // หน้าที่มีปุ่มเพิ่มในแถวเมนู (โปรไฟล์) จอแคบรวมแท็บเป็นเมนูเดียว หน้าอื่นใช้ปุ่มแยกเหมือนเดิม
  const compactTabs = useLocation().pathname.endsWith('/profiles')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  // ช่องว่างขวาสุดของแถวเมนูย่อย ให้หน้าย่อยวางปุ่มของตัวเอง (ผ่าน portal)
  const [actionSlot, setActionSlot] = useState<HTMLElement | null>(null)

  // เลือกอยู่ที่ถูกลบไปแล้ว/ยังไม่เลือก -> โปรไฟล์ "ฉัน" หรืออันแรก
  const selected = state.profiles.find((p) => p.id === selectedId) ?? state.profiles.find((p) => p.is_self) ?? state.profiles[0] ?? null
  const context: SizeContext = { ...state, selected, selectProfile: setSelectedId, actionSlot }

  return (
    <>
      <PageHeader maxWidth="max-w-4xl">
        <h1 className="text-xl font-semibold text-gray-900">ไซส์ไหนคือฉัน</h1>
        {/* หน้าโปรไฟล์ (มีปุ่มเพิ่มในแถวเมนู): จอแคบเรียง 2 แถว (บน = 3 ปุ่มแท็บ, ล่าง = ปุ่มเพิ่ม) ย่อจอแล้วลดแค่ความกว้าง; จอ sm ขึ้นไปและหน้าอื่นเป็นแถวเดียว (หน้าอื่นตกบรรทัดเมื่อแคบ) */}
        <div className={compactTabs ? 'mt-2 grid grid-cols-3 gap-2 sm:flex sm:items-center sm:justify-between' : 'mt-2 flex items-center justify-between gap-2'}>
          <nav
            className={compactTabs ? 'contents sm:flex sm:min-w-0 sm:flex-wrap sm:gap-2' : 'flex min-w-0 flex-wrap gap-2'}
            aria-label="เมนูย่อยไซส์ไหนคือฉัน"
          >
            {TABS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm whitespace-nowrap transition-colors ${
                    compactTabs ? 'min-w-0 justify-center sm:justify-start' : ''
                  } ${isActive ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'}`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{label}</span>
              </NavLink>
            ))}
          </nav>
          <div ref={setActionSlot} className="col-span-3 flex empty:hidden sm:col-auto sm:shrink-0" />
        </div>
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
