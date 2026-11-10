import { ACTIVITY_LEVELS } from '../constants'
import type { CalorieProfile } from '../types/calorie'
import { formatKcal } from '../utils/format'

function Card({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{note}</p>
    </div>
  )
}

/** ผลคำนวณล่าสุดที่บันทึกไว้ */
export function BmrResultCards({ profile }: { profile: CalorieProfile }) {
  const activity = ACTIVITY_LEVELS[profile.activity_level]
  return (
    <section aria-label="ผลการคำนวณ" className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Card label="BMR (พลังงานขณะพัก)" value={formatKcal(profile.bmr)} note="สูตร Mifflin-St Jeor ต่อวัน" />
        <Card
          label="TDEE (พลังงานที่ใช้จริงต่อวัน)"
          value={formatKcal(profile.tdee)}
          note={`BMR × ${activity.multiplier} (${activity.label})`}
        />
      </div>
      <p className="text-xs text-gray-500">
        ผลที่ได้เป็นค่าประมาณ ไม่ใช่คำแนะนำทางการแพทย์ TDEE นี้ใช้เป็นเป้าหมายแคลอรี่ในหน้าบันทึกอาหารและหน้าสรุป
      </p>
    </section>
  )
}
