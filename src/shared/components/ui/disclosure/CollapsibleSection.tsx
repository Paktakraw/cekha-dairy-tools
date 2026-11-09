import { ChevronDown, ChevronUp, type LucideIcon } from 'lucide-react'
import { useId, useState, type ReactNode } from 'react'

interface CollapsibleSectionProps {
  title: string
  icon?: LucideIcon
  /** ข้อความเล็กข้างชื่อ เช่น "กำลังกรองอยู่" (เห็นได้แม้ยุบอยู่) */
  hint?: ReactNode
  defaultOpen?: boolean
  children: ReactNode
}

/**
 * Section ที่ยุบ/ขยายได้ด้วยลูกศรมุมบนขวา (▲ ขยายอยู่ กดเพื่อยุบ / ▼ ยุบอยู่ กดเพื่อขยาย)
 * เนื้อหายังอยู่ใน DOM ตอนยุบ (แค่ซ่อน) จึงไม่เสียค่าที่กรอกไว้ในฟอร์มหรือ filter
 */
export function CollapsibleSection({ title, icon: Icon, hint, defaultOpen = true, children }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  const panelId = useId()
  const Chevron = open ? ChevronUp : ChevronDown

  return (
    <section className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <h2 className="text-lg font-semibold text-gray-900">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          title={open ? `ยุบ ${title}` : `ขยาย ${title}`}
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center gap-2 rounded-md text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
        >
          {Icon && <Icon className="h-5 w-5 shrink-0 text-gray-700" aria-hidden="true" />}
          <span>{title}</span>
          {hint && <span className="ml-1 text-xs font-normal text-gray-500">{hint}</span>}
          <Chevron className="ml-auto h-5 w-5 shrink-0 text-gray-500" aria-hidden="true" />
        </button>
      </h2>
      <div id={panelId} hidden={!open} className="mt-4">
        {children}
      </div>
    </section>
  )
}
