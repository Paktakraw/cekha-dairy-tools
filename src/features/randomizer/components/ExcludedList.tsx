import type { RandomItem } from '../types/random'

interface ExcludedListProps {
  items: RandomItem[]
  groupNameById: Map<string, string>
}

/** รายการที่สุ่มไปแล้วใน Session นี้ (Excluded Pool) เรียงตามลำดับที่สุ่ม */
export function ExcludedList({ items, groupNameById }: ExcludedListProps) {
  return (
    <section>
      <h2 className="mb-2 text-sm font-medium text-gray-700">สุ่มไปแล้ว ({items.length})</h2>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500">ยังไม่มีรายการที่สุ่มไปแล้ว</p>
      ) : (
        <ol className="divide-y divide-gray-200 rounded-md border border-gray-200 bg-white">
          {items.map((item, index) => (
            <li key={item.id} className="flex items-baseline gap-3 px-3 py-2 text-sm">
              <span className="w-5 shrink-0 text-gray-400">{index + 1}</span>
              <span className="min-w-0 break-words text-gray-800">{item.label}</span>
              <span className="ml-auto shrink-0 text-xs text-gray-400">{groupNameById.get(item.group_id)}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
