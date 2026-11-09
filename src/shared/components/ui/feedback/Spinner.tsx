import { Loader2 } from 'lucide-react'

export function Spinner({ label = 'กำลังโหลด...' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-500" role="status">
      <Loader2 className="h-4 w-4 animate-spin" />
      {label}
    </div>
  )
}
