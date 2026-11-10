import { Check, Search } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Input } from '../../../shared/components/ui'
import type { Food } from '../types/calorie'
import { formatKcal } from '../utils/format'

interface FoodPickerProps {
  foods: Food[]
  selectedId: string | null
  error?: string
  onSelect: (food: Food) => void
}

/** ค้นหาจากรายการที่โหลดมาแล้ว (ไม่เรียก API) แล้วเลือกอาหาร 1 รายการ */
export function FoodPicker({ foods, selectedId, error, onSelect }: FoodPickerProps) {
  const [query, setQuery] = useState('')
  const term = query.trim().toLowerCase()
  const matches = term === '' ? foods : foods.filter((f) => f.name.toLowerCase().includes(term))

  return (
    <div className="flex flex-col gap-2">
      <Input
        label="ค้นหาอาหาร"
        type="search"
        placeholder="พิมพ์ชื่ออาหาร เช่น กะเพรา"
        value={query}
        error={error}
        onChange={(e) => setQuery(e.target.value)}
      />
      <ul
        role="listbox"
        aria-label="รายการอาหาร"
        className="max-h-52 divide-y divide-gray-100 overflow-y-auto rounded-md border border-gray-200 bg-white"
      >
        {matches.length === 0 && (
          <li className="px-3 py-3 text-sm text-gray-500">
            <Search className="mr-1 inline h-4 w-4" aria-hidden="true" />
            ไม่พบอาหารที่ค้นหา — เพิ่มอาหารใหม่ได้ที่หน้า{' '}
            <Link to="/calorie/foods" className="font-medium text-gray-900 underline">
              รายการอาหาร
            </Link>
          </li>
        )}
        {matches.map((food) => {
          const selected = food.id === selectedId
          return (
            <li key={food.id} role="option" aria-selected={selected}>
              <button
                type="button"
                onClick={() => onSelect(food)}
                className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                  selected ? 'bg-gray-100 font-medium' : ''
                }`}
              >
                <span className="min-w-0 break-words text-gray-900">{food.name}</span>
                <span className="flex shrink-0 items-center gap-2 text-xs text-gray-600">
                  {formatKcal(food.kcal_per_unit)} / {food.serving_unit}
                  {selected && <Check className="h-4 w-4 text-gray-900" aria-hidden="true" />}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
