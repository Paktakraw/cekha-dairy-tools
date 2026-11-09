import type { ButtonHTMLAttributes } from 'react'
import type { LucideIcon } from 'lucide-react'

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'title'> {
  icon: LucideIcon
  /** ใช้เป็นทั้ง Tooltip และ aria-label */
  label: string
  tone?: 'default' | 'danger'
}

export function IconButton({ icon: Icon, label, tone = 'default', className = '', type = 'button', ...props }: IconButtonProps) {
  const toneClass = tone === 'danger' ? 'text-red-700 hover:bg-red-50' : 'text-gray-600 hover:bg-gray-100'
  return (
    <button
      type={type}
      title={label}
      aria-label={label}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-gray-900 disabled:cursor-not-allowed disabled:opacity-50 ${toneClass} ${className}`}
      {...props}
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}
