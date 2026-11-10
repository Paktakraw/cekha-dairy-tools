import { Pencil, Trash2 } from 'lucide-react'
import { CollapsibleSection, IconButton } from '../../../shared/components/ui'
import { MEAL_LABELS } from '../constants'
import type { FoodEntry, MealSummary } from '../types/calorie'
import { formatKcal, formatQuantity } from '../utils/format'
import { entryCalories } from '../utils/summary'

interface MealSectionProps {
  summary: MealSummary
  onEdit: (entry: FoodEntry) => void
  onDelete: (entry: FoodEntry) => void
}

/** รายการอาหารของมื้อหนึ่ง ยุบไว้เป็นค่าเริ่มต้น (ยอดรวมของมื้อเห็นได้แม้ยุบอยู่) กดลูกศรมุมขวาเพื่อขยาย */
export function MealSection({ summary, onEdit, onDelete }: MealSectionProps) {
  return (
    <CollapsibleSection
      title={MEAL_LABELS[summary.meal]}
      defaultOpen={false}
      hint={`${summary.entries.length} รายการ · ${formatKcal(summary.total)}`}
    >
      {summary.entries.length === 0 ? (
        <p className="rounded-md border border-dashed border-gray-300 bg-white px-3 py-3 text-sm text-gray-500">
          ยังไม่มีรายการ
        </p>
      ) : (
        <ul className="divide-y divide-gray-200 rounded-md border border-gray-200 bg-white">
          {summary.entries.map((entry) => (
            <li key={entry.id} className="flex items-center justify-between gap-2 py-1 pr-1 pl-3">
              <div className="min-w-0 py-1">
                <p className="text-sm font-medium break-words text-gray-900">{entry.food_name}</p>
                <p className="text-xs text-gray-500">
                  {formatQuantity(entry.quantity)} {entry.serving_unit} × {formatKcal(entry.kcal_per_unit)}
                </p>
              </div>
              <div className="flex shrink-0 items-center">
                <span className="mr-1 text-sm font-medium text-gray-900">
                  {formatKcal(entryCalories(entry.kcal_per_unit, entry.quantity))}
                </span>
                <IconButton icon={Pencil} label={`แก้ไข ${entry.food_name}`} onClick={() => onEdit(entry)} />
                <IconButton icon={Trash2} label={`ลบ ${entry.food_name}`} tone="danger" onClick={() => onDelete(entry)} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </CollapsibleSection>
  )
}
