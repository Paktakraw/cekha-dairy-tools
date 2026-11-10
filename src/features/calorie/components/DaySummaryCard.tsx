import { Link } from 'react-router-dom'
import { formatKcal } from '../utils/format'
import { CalorieBar } from './CalorieBar'

interface DaySummaryCardProps {
  total: number
  /** TDEE จากโปรไฟล์ (null = ยังไม่เคยคำนวณ) */
  target: number | null
}

/** แคลอรี่รวมของวัน เทียบกับเป้าหมาย (TDEE) */
export function DaySummaryCard({ total, target }: DaySummaryCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div>
        <p className="text-xs text-gray-500">แคลอรี่รวมทั้งวัน</p>
        <p className="mt-1 text-2xl font-semibold text-gray-900">{formatKcal(total)}</p>
      </div>
      {target === null ? (
        <p className="text-sm text-gray-600">
          ยังไม่มีเป้าหมายแคลอรี่ —{' '}
          <Link to="/calorie/bmr" className="font-medium text-gray-900 underline">
            คำนวณ BMR/TDEE
          </Link>{' '}
          เพื่อเปรียบเทียบ
        </p>
      ) : (
        <>
          <CalorieBar total={total} target={target} label="แคลอรี่ที่กินเทียบกับเป้าหมาย (TDEE)" />
          <p className="text-sm text-gray-600">
            เป้าหมาย (TDEE) {formatKcal(target)} —{' '}
            {total <= target ? `เหลืออีก ${formatKcal(target - total)}` : `เกินเป้าหมาย ${formatKcal(total - target)}`}
          </p>
        </>
      )}
    </div>
  )
}
