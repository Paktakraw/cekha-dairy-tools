import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, type LucideIcon } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'

export interface TabItem {
  to: string
  label: string
  icon: LucideIcon
}

interface TabMenuProps {
  tabs: TabItem[]
  label: string
}

/** เมนูย่อยแบบรวมปุ่มเดียวสำหรับจอแคบ: แสดงหน้าปัจจุบัน กดแล้วเปิดรายการทุกหน้า */
export function TabMenu({ tabs, label }: TabMenuProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const { pathname } = useLocation()
  const current = tabs.find((t) => pathname.endsWith(`/${t.to}`)) ?? tabs[0]

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  if (!current) return null
  const CurrentIcon = current.icon

  return (
    <div ref={rootRef} className="relative min-w-0">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${label}: ${current.label} (กดเพื่อเลือกหน้า)`}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-md border border-gray-900 bg-gray-900 px-3 py-1.5 text-sm whitespace-nowrap text-white focus-visible:outline-2 focus-visible:outline-gray-900"
      >
        <CurrentIcon className="h-4 w-4" />
        {current.label}
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ul role="menu" aria-label={label} className="absolute left-0 z-30 mt-1 min-w-44 rounded-md border border-gray-200 bg-white p-1 shadow-md">
          {tabs.map(({ to, label: tabLabel, icon: Icon }) => (
            <li key={to} role="none">
              <NavLink
                to={to}
                role="menuitem"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded px-3 py-2 text-sm transition-colors ${
                    isActive ? 'bg-gray-100 font-medium text-gray-900' : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1">{tabLabel}</span>
                {current.to === to && <Check className="h-4 w-4" />}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
