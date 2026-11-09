import { Construction } from 'lucide-react'

export function FeaturePlaceholder({ title, phase }: { title: string; phase: string }) {
  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      <div className="mt-6 flex flex-col items-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
        <Construction className="h-8 w-8 text-gray-400" />
        <p className="text-sm text-gray-600">หน้านี้เป็น placeholder จะพัฒนาจริงใน {phase}</p>
      </div>
    </div>
  )
}
