import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import { IconButton } from '../ui'

/** ปุ่มสลับธีม 2 ปุ่ม (ไอคอนอย่างเดียว): พระอาทิตย์ = สว่าง, พระจันทร์ = มืด */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  return (
    <div role="group" aria-label="ธีม" className={`flex gap-1 ${className}`}>
      <IconButton icon={Sun} size="sm" label="โหมดสว่าง" active={theme === 'light'} onClick={() => setTheme('light')} />
      <IconButton icon={Moon} size="sm" label="โหมดมืด" active={theme === 'dark'} onClick={() => setTheme('dark')} />
    </div>
  )
}
