import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button, ConfirmDialog, EmptyState, ErrorState, Modal, Spinner } from '../../../shared/components/ui'
import { formatDate, todayISO } from '../../../shared/utils/formatDate'
import { DateNavigator } from '../components/DateNavigator'
import { DaySummaryCard } from '../components/DaySummaryCard'
import { FoodEntryForm } from '../components/FoodEntryForm'
import { MealSection } from '../components/MealSection'
import { useBmrProfile } from '../hooks/useBmrProfile'
import { useFoodEntries } from '../hooks/useFoodEntries'
import { useFoods } from '../hooks/useFoods'
import type { FoodEntry } from '../types/calorie'
import { summarizeDay } from '../utils/summary'

/** null = ปิด, 'new' = เพิ่มรายการ, FoodEntry = แก้ไขรายการนั้น */
type FormState = null | 'new' | FoodEntry

export default function FoodPage() {
  const today = todayISO()
  const [date, setDate] = useState(today)
  const foods = useFoods()
  const profile = useBmrProfile()
  const log = useFoodEntries(date, date)
  const [formState, setFormState] = useState<FormState>(null)
  const [deleting, setDeleting] = useState<FoodEntry | null>(null)
  const [deletingBusy, setDeletingBusy] = useState(false)

  const summary = useMemo(() => summarizeDay(log.entries), [log.entries])

  if (foods.loading) return <Spinner />
  if (foods.error) {
    return <ErrorState title="โหลดรายการอาหารไม่สำเร็จ" description={foods.error} onRetry={foods.reload} />
  }

  const closeForm = () => setFormState(null)

  const confirmDelete = async () => {
    if (!deleting) return
    setDeletingBusy(true)
    await log.removeEntry(deleting.id)
    setDeletingBusy(false)
    setDeleting(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <DateNavigator date={date} today={today} onChange={setDate} />

      <section>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-gray-900">{date === today ? 'วันนี้' : formatDate(date)}</h2>
          <Button size="sm" className="shrink-0" onClick={() => setFormState('new')}>
            <Plus className="h-3.5 w-3.5" />
            เพิ่มอาหาร
          </Button>
        </div>

        {log.firstLoad && <Spinner />}

        {!log.firstLoad && log.error && (
          <ErrorState title="โหลดรายการอาหารที่กินไม่สำเร็จ" description={log.error} onRetry={log.reload} />
        )}

        {!log.firstLoad && !log.error && (
          <div className={`flex flex-col gap-6 ${log.loading ? 'opacity-60 transition-opacity' : 'transition-opacity'}`}>
            <DaySummaryCard total={summary.total} target={profile.profile?.tdee ?? null} />

            {log.entries.length === 0 && (
              <EmptyState
                title="ยังไม่มีรายการอาหารในวันนี้"
                description="กด “เพิ่มอาหาร” เพื่อเลือกอาหารและดูแคลอรี่"
              />
            )}

            {log.entries.length > 0 &&
              summary.meals.map((meal) => (
                <MealSection key={meal.meal} summary={meal} onEdit={setFormState} onDelete={setDeleting} />
              ))}
          </div>
        )}
      </section>

      <Modal open={formState !== null} title={formState === 'new' ? 'เพิ่มอาหาร' : 'แก้ไขรายการอาหาร'} onClose={closeForm}>
        {formState !== null && (
          <FoodEntryForm
            key={formState === 'new' ? 'new' : formState.id}
            foods={foods.foods}
            entry={formState === 'new' ? undefined : formState}
            defaultDate={date}
            onSubmit={(input, food) => {
              if (formState !== 'new') return log.editEntry(formState.id, input)
              return food ? log.addEntry(input, food) : Promise.resolve('กรุณาเลือกอาหาร')
            }}
            onCancel={closeForm}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="ลบรายการอาหาร"
        message={`ต้องการลบ “${deleting?.food_name ?? ''}” ออกจากบันทึกใช่หรือไม่ การลบไม่สามารถย้อนกลับได้`}
        loading={deletingBusy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
