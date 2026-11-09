import { Pencil, Trash2 } from 'lucide-react'
import { IconButton } from '../../../shared/components/ui'
import type { RandomItem } from '../types/random'

interface ItemListProps {
  items: RandomItem[]
  onEdit: (item: RandomItem) => void
  onDelete: (item: RandomItem) => void
}

export function ItemList({ items, onEdit, onDelete }: ItemListProps) {
  if (items.length === 0) {
    return <p className="px-1 py-2 text-sm text-gray-500">ยังไม่มีรายการในกลุ่มนี้</p>
  }

  return (
    <ul className="divide-y divide-gray-200 rounded-md border border-gray-200 bg-white">
      {items.map((item) => (
        <li key={item.id} className="flex items-center justify-between gap-2 py-1 pr-1 pl-3">
          <span className="min-w-0 text-sm break-words text-gray-800">{item.label}</span>
          <div className="flex shrink-0">
            <IconButton icon={Pencil} label={`แก้ไข ${item.label}`} onClick={() => onEdit(item)} />
            <IconButton icon={Trash2} label={`ลบ ${item.label}`} tone="danger" onClick={() => onDelete(item)} />
          </div>
        </li>
      ))}
    </ul>
  )
}
