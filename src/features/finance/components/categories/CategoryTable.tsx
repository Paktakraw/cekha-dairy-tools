import { Pencil, Trash2 } from 'lucide-react'
import { IconButton } from '../../../../shared/components/ui'
import type { Category } from '../../types/finance'

interface CategoryTableProps {
  title: string
  categories: Category[]
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
}

/** รายการหมวดหมู่ของประเภทหนึ่ง (แยกรายรับ/รายจ่ายโดยหน้า CategoryPage) */
export function CategoryTable({ title, categories, onEdit, onDelete }: CategoryTableProps) {
  return (
    <section>
      <h2 className="mb-2 text-sm font-medium text-gray-700">
        {title} ({categories.length})
      </h2>
      {categories.length === 0 ? (
        <p className="rounded-md border border-dashed border-gray-300 bg-gray-50 px-3 py-4 text-sm text-gray-500">
          ยังไม่มีหมวดหมู่
        </p>
      ) : (
        <ul className="divide-y divide-gray-200 rounded-md border border-gray-200 bg-white">
          {categories.map((category) => (
            <li key={category.id} className="flex items-center justify-between gap-2 py-1 pr-1 pl-3">
              <div className="min-w-0 py-1">
                <p className="text-sm font-medium break-words text-gray-900">{category.name}</p>
                {category.description && <p className="text-xs break-words text-gray-500">{category.description}</p>}
              </div>
              <div className="flex shrink-0">
                <IconButton icon={Pencil} label={`แก้ไข ${category.name}`} onClick={() => onEdit(category)} />
                <IconButton icon={Trash2} label={`ลบ ${category.name}`} tone="danger" onClick={() => onDelete(category)} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
