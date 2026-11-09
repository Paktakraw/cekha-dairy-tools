import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { FeatureConfig } from '../shared/types/feature'

export default function PortalHomePage({ features }: { features: FeatureConfig[] }) {
  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900">Daily Life Portal</h1>
      <p className="mt-1 text-sm text-gray-500">เลือกเครื่องมือที่ต้องการใช้งาน</p>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
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
  )
}
