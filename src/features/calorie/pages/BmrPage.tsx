import { ErrorState, Spinner } from '../../../shared/components/ui'
import { formatDateTime } from '../../../shared/utils/formatDate'
import { BmrForm } from '../components/BmrForm'
import { BmrResultCards } from '../components/BmrResultCards'
import { useBmrProfile } from '../hooks/useBmrProfile'

export default function BmrPage() {
  const { profile, loading, error, reload, saveProfile } = useBmrProfile()

  if (loading) return <Spinner />
  if (error) return <ErrorState title="โหลดข้อมูล BMR ไม่สำเร็จ" description={error} onRetry={reload} />

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h2 className="mb-1 text-lg font-semibold text-gray-900">คำนวณ BMR / TDEE</h2>
        <p className="mb-4 text-sm text-gray-600">
          BMR คือพลังงานที่ร่างกายใช้ขณะพัก ส่วน TDEE คือพลังงานที่ใช้จริงต่อวันเมื่อรวมกิจกรรม
        </p>
        <BmrForm profile={profile} onSubmit={saveProfile} />
      </section>

      {profile ? (
        <>
          <BmrResultCards profile={profile} />
          <p className="text-xs text-gray-400">บันทึกล่าสุด {formatDateTime(profile.updated_at)}</p>
        </>
      ) : (
        <p className="rounded-md border border-dashed border-gray-300 bg-gray-50 px-3 py-4 text-sm text-gray-500">
          กรอกข้อมูลด้านบนแล้วกด “คำนวณและบันทึก” เพื่อดูผล
        </p>
      )}
    </div>
  )
}
