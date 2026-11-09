import type { RandomGroup, RandomItem } from '../types/random'

interface GroupSelectorProps {
  groups: RandomGroup[]
  items: RandomItem[]
  selectedGroupIds: string[]
  /** ปิดการเลือกชั่วคราว (ระหว่าง animation สุ่ม) */
  disabled?: boolean
  onToggle: (groupId: string) => void
}

/** เลือกได้หลายกลุ่มพร้อมกันด้วย Checkbox เพื่อรวมเป็นกองสุ่มเดียว */
export function GroupSelector({ groups, items, selectedGroupIds, disabled = false, onToggle }: GroupSelectorProps) {
  return (
    <fieldset disabled={disabled} className={disabled ? 'opacity-60' : ''}>
      <legend className="mb-2 text-sm font-medium text-gray-700">เลือกกลุ่มที่ต้องการสุ่ม</legend>
      <div className="flex flex-wrap gap-2">
        {groups.map((group) => {
          const checked = selectedGroupIds.includes(group.id)
          const count = items.filter((i) => i.group_id === group.id).length
          return (
            <label
              key={group.id}
              className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                disabled ? 'cursor-not-allowed' : 'cursor-pointer'
              } ${checked ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'}`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(group.id)}
                className="h-4 w-4 accent-gray-900"
              />
              <span className="break-words">{group.name}</span>
              <span className={checked ? 'text-gray-300' : 'text-gray-400'}>({count})</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
