import { Home, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import type { FeatureConfig } from '../../types/feature'
import { IconButton } from '../ui'

interface SidebarProps {
  features: FeatureConfig[]
  /** drawer เปิดอยู่ (มือถือ/แท็บเล็ต) */
  open: boolean
  onClose: () => void
  /** ย่อเป็นแถบไอคอน (เฉพาะคอม lg ขึ้นไป; drawer บนมือถือแสดงเต็มเสมอ) */
  collapsed: boolean
  onToggleCollapse: () => void
}

const makeLinkClass =
  (collapsed: boolean) =>
  ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
      collapsed ? 'lg:justify-center lg:px-0' : ''
    } ${isActive ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-200'}`

export function Sidebar({ features, open, onClose, collapsed, onToggleCollapse }: SidebarProps) {
  const linkClass = makeLinkClass(collapsed)
  // ตอนย่อ ซ่อนข้อความแต่ยังให้ screen reader อ่านได้
  const labelClass = collapsed ? 'lg:sr-only' : ''

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onClose} />}
      {/* ต่ำกว่า lg: drawer (fixed, กว้างเต็มเสมอ) | lg ขึ้นไป: sticky เต็มความสูงจอ ไม่เลื่อนตามเนื้อหา และย่อ/ขยายได้ */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-gray-200 bg-gray-100 transition-[transform,width] lg:sticky lg:top-0 lg:bottom-auto lg:z-auto lg:h-dvh lg:shrink-0 lg:self-start lg:translate-x-0 ${
          collapsed ? 'lg:w-16' : 'lg:w-64'
        } ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div
          className={`flex h-14 shrink-0 items-center justify-between border-b border-gray-200 px-4 ${
            collapsed ? 'lg:justify-center lg:px-0' : ''
          }`}
        >
          <span className={`font-semibold whitespace-nowrap text-gray-900 ${collapsed ? 'lg:hidden' : ''}`}>
            Daily Life Portal
          </span>
          <IconButton icon={X} label="ปิดเมนู" className="lg:hidden" onClick={onClose} />
          <div className="hidden lg:block">
            <IconButton
              icon={collapsed ? PanelLeftOpen : PanelLeftClose}
              label={collapsed ? 'ขยายเมนู' : 'ย่อเมนู'}
              aria-expanded={!collapsed}
              onClick={onToggleCollapse}
            />
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden p-3" aria-label="เมนูหลัก">
          <NavLink to="/" end title="หน้าหลัก" className={linkClass} onClick={onClose}>
            <Home className="h-4 w-4 shrink-0" />
            <span className={labelClass}>หน้าหลัก</span>
          </NavLink>
          {features.map(({ id, name, icon: Icon, path }) => (
            <NavLink key={id} to={path} title={name} className={linkClass} onClick={onClose}>
              <Icon className="h-4 w-4 shrink-0" />
              <span className={`${labelClass} whitespace-nowrap`}>{name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}
