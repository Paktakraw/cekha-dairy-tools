import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react'
import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { TodayOverview } from '../shared/components/dashboard/TodayOverview'
import type { FeatureConfig } from '../shared/types/feature'

export default function PortalHomePage({ features }: { features: FeatureConfig[] }) {
  const [open, setOpen] = useState(true)
  const panelId = useId()
  const Chevron = open ? ChevronUp : ChevronDown
  return (
    <div>
      <div>
        <TodayOverview features={features} />
      </div>
      <section aria-labelledby="tools-title">
        <div className="flex items-center justify-between gap-2">
          <h2 id="tools-title" className="text-base font-semibold text-gray-900">
            เครื่องมือที่ต้องการ
          </h2>
          <button
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={open ? 'ย่อเครื่องมือที่ต้องการ' : 'ขยายเครื่องมือที่ต้องการ'}
            title={open ? 'ย่อเครื่องมือที่ต้องการ' : 'ขยายเครื่องมือที่ต้องการ'}
            onClick={() => setOpen((v) => !v)}
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
          >
            <Chevron className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div id={panelId} hidden={!open} className="mt-3">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
            {features.map(({ id, name, description, icon: Icon, path }) => (
              <Link
                key={id}
                to={path}
                className="group flex flex-col gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 sm:gap-3 sm:p-5 transition-colors hover:border-gray-400 hover:bg-white"
              >
                <Icon className="h-5 w-5 text-gray-800 sm:h-6 sm:w-6" />
                <div>
                  <h2 className="text-sm font-medium break-words text-gray-900 sm:text-base">{name}</h2>
                  <p className="mt-1 text-xs break-words text-gray-500 sm:text-sm">{description}</p>
                </div>
                <ArrowRight className="mt-auto h-4 w-4 self-end text-gray-400 group-hover:text-gray-900" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
