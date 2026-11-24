import { ChevronDown, ChevronUp } from 'lucide-react'
import { Suspense, useId, useState } from 'react'
import type { FeatureConfig } from '../../types/feature'
import { formatDateLong, todayISO } from '../../utils/formatDate'

function WidgetSkeleton() {
  return <div className="h-28 animate-pulse rounded-lg border border-gray-200 bg-gray-100" role="status" aria-label="กำลังโหลด" />
}

/**
 * ภาพรวมวันนี้: วางการ์ดของทุกฟีเจอร์ที่ส่ง todayWidget มาให้ตามลำดับใน Registry
 * ไม่รู้จักข้อมูลของฟีเจอร์ใด ๆ (ไม่ import ข้ามฟีเจอร์)
 * ย่อไว้เสมอเมื่อเปิดหน้า (ไม่จำสถานะ) การ์ดเริ่มโหลดข้อมูลเมื่อกางครั้งแรก และไม่โหลดซ้ำเมื่อย่อแล้วกางใหม่
 */
export function TodayOverview({ features }: { features: FeatureConfig[] }) {
  const [open, setOpen] = useState(false)
  const [opened, setOpened] = useState(false)
  const panelId = useId()
  const widgets = features.filter((f) => f.todayWidget !== undefined)
  if (widgets.length === 0) return null

  const toggle = () => {
    setOpen((v) => !v)
    setOpened(true)
  }
  const Chevron = open ? ChevronUp : ChevronDown

  return (
    <section aria-labelledby="today-overview-title" className="mb-8">
      <h2 id="today-overview-title" className="text-base font-semibold text-gray-900">
        ภาพรวมวันนี้
      </h2>
      <div className="mt-0.5 flex items-center justify-between gap-2">
        <p className="text-sm text-gray-500">{formatDateLong(todayISO())}</p>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={open ? 'ย่อภาพรวมวันนี้' : 'ขยายภาพรวมวันนี้'}
          title={open ? 'ย่อภาพรวมวันนี้' : 'ขยายภาพรวมวันนี้'}
          onClick={toggle}
          className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
        >
          <Chevron className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
      <div id={panelId} hidden={!open}>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3">
          {opened &&
            widgets.map(({ id, name, icon, path, todayWidget: Widget }) =>
              Widget ? (
                <Suspense key={id} fallback={<WidgetSkeleton />}>
                  <Widget name={name} icon={icon} path={path} />
                </Suspense>
              ) : null,
            )}
        </div>
      </div>
    </section>
  )
}
