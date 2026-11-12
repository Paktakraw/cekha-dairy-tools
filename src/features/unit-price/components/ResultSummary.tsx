import { Scale, TriangleAlert } from 'lucide-react'
import { EmptyState, Select } from '../../../shared/components/ui'
import type { ComparisonResult, OptionInput, UnitGroup } from '../types/unitPrice'
import { formatPercent, formatUnitPrice } from '../utils/format'
import { pricePerResultUnit } from '../utils/unitPrice'
import { findResultUnit, RESULT_UNITS } from '../utils/units'

interface ResultSummaryProps {
  result: ComparisonResult | null
  options: OptionInput[]
  resultUnitIds: Record<UnitGroup, string>
  onResultUnitChange: (group: UnitGroup, unitId: string) => void
}

export function ResultSummary({ result, options, resultUnitIds, onResultUnitChange }: ResultSummaryProps) {
  if (result === null) {
    return (
      <EmptyState title="กรอกข้อมูลแล้วกด “เปรียบเทียบ”" description="ผลจะแสดงที่นี่ว่าตัวเลือกไหนคุ้มที่สุด" />
    )
  }

  if (result.status === 'not-enough') {
    return (
      <EmptyState
        title="กรอกราคาและปริมาณอย่างน้อย 2 ตัวเลือก"
        description="ระบบจะเทียบให้ทันทีว่าตัวเลือกไหนคุ้มที่สุด"
      />
    )
  }

  if (result.status === 'mixed-groups') {
    return (
      <div role="alert" className="flex items-start gap-2 rounded-lg border border-gray-300 bg-gray-50 p-4 text-sm text-gray-800">
        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" />
        <p>เทียบกันไม่ได้ เพราะหน่วยอยู่คนละกลุ่ม (น้ำหนัก ปริมาตร และชิ้น เทียบข้ามกลุ่มกันไม่ได้) กรุณาเลือกหน่วยให้อยู่กลุ่มเดียวกัน</p>
      </div>
    )
  }

  const { group, items, allEqual } = result
  const resultUnit = findResultUnit(group, resultUnitIds[group])
  const nameOf = (id: string) => {
    const index = options.findIndex((o) => o.id === id)
    return options[index]?.name.trim() || `ตัวเลือกที่ ${index + 1}`
  }
  const sorted = [...items].sort((a, b) => a.pricePerBase - b.pricePerBase)

  return (
    <section className="flex flex-col gap-3" aria-label="ผลการเทียบราคา" aria-live="polite">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <Scale className="h-5 w-5 text-gray-500" />
          ผลการเทียบ
        </h2>
        {RESULT_UNITS[group].length > 1 && (
          <div className="w-44">
            <Select label="แสดงราคาต่อ" value={resultUnit.id} onChange={(e) => onResultUnitChange(group, e.target.value)}>
              {RESULT_UNITS[group].map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
            </Select>
          </div>
        )}
      </div>

      {allEqual && <p className="rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-700">ราคาเท่ากัน ทุกตัวเลือกคุ้มเท่ากัน</p>}

      <ul className="flex flex-col gap-2">
        {sorted.map((item) => (
          <li
            key={item.id}
            className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 ${
              item.isCheapest && !allEqual ? 'border-gray-900 bg-white' : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-900">{nameOf(item.id)}</p>
              {item.isCheapest && !allEqual && (
                <span className="mt-1 inline-block rounded bg-green-700 px-2 py-0.5 text-xs font-medium text-white">คุ้มที่สุด</span>
              )}
              {!item.isCheapest && <p className="mt-0.5 text-xs text-gray-500">แพงกว่า {formatPercent(item.percentMore)}%</p>}
            </div>
            <p className="shrink-0 text-right text-base font-semibold text-gray-900">
              {formatUnitPrice(pricePerResultUnit(item.pricePerBase, resultUnit))}
              <span className="block text-xs font-normal text-gray-500">ต่อ {resultUnit.label}</span>
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
