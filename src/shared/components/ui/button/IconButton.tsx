import type { ButtonHTMLAttributes } from 'react'
import type { LucideIcon } from 'lucide-react'

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'title'> {
  icon: LucideIcon
  /** ใช้เป็นทั้ง Tooltip และ aria-label */
  label: string
  tone?: 'default' | 'danger'
  /** sm = 32px (แถบเครื่องมือที่พื้นที่จำกัด), md = 36px */
  size?: 'md' | 'sm'
  /** ปุ่มแบบเลือกได้ (เช่น สลับธีม): true = เลือกอยู่ (ใส่ aria-pressed ให้อัตโนมัติ) */
  active?: boolean
}

export function IconButton({ icon: Icon, label, tone = 'default', size = 'md', active, className = '', type = 'button', ...props }: IconButtonProps) {
  const toneClass = active
    ? 'bg-gray-900 text-white'
    : tone === 'danger'
      ? 'text-red-700 hover:bg-red-50'
      : 'text-gray-600 hover:bg-gray-100'
  const sizeClass = size === 'sm' ? 'h-8 w-8' : 'h-9 w-9'
  return (
    <button
      type={type}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={`inline-flex ${sizeClass} items-center justify-center rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-gray-900 disabled:cursor-not-allowed disabled:opacity-50 ${toneClass} ${className}`}
      {...props}
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}
