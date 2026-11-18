import type { ConvResult } from '../types/size'
import { MEASURE_LABELS } from '../constants'
import { APPROX_NOTE } from '../utils/converter'

interface ConversionTableProps {
  result: ConvResult
  /** แสดงคอลัมน์ "ที่แนะนำ" */
  showRecommended: boolean
}

export function ConversionTable({ result, showRecommended }: ConversionTableProps) {
  if (result.missing.length > 0) {
    return (
      <p className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
        ยังไม่มีข้อมูลสำหรับหมวดนี้ กรอก {result.missing.map((k) => `“${MEASURE_LABELS[k]}”`).join(' หรือ ')} ก่อน
      </p>
    )
  }

  const hasRecommended = showRecommended && result.rows.some((r) => r.recommended !== undefined)

  return (
    <div className="flex flex-col gap-2">
      {result.rows.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-3 py-2 font-medium">มาตรฐาน</th>
                <th className="px-3 py-2 font-medium">ตามตัวเลข</th>
                {hasRecommended && <th className="px-3 py-2 font-medium">ที่แนะนำ</th>}
              </tr>
            </thead>
            <tbody>
              {result.rows.map((row) => (
                <tr key={row.label} className="border-t border-gray-200">
                  <td className="px-3 py-2 text-gray-700">{row.label}</td>
                  <td className="px-3 py-2 font-medium text-gray-900">{row.value}</td>
                  {hasRecommended && <td className="px-3 py-2 font-medium text-gray-900">{row.recommended ?? '—'}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {result.notes.map((note) => (
        <p key={note} className="text-xs text-gray-600">
          {note}
        </p>
      ))}
      {result.rows.length > 0 && <p className="text-xs text-gray-500">{APPROX_NOTE}</p>}
    </div>
  )
}
