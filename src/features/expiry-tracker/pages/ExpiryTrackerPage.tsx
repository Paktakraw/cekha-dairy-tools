import { useState } from 'react'
import { Plus } from 'lucide-react'
import { PageHeader } from '../../../shared/components/layout/PageHeader'
import { Button, ConfirmDialog, EmptyState, ErrorState, Modal, Spinner } from '../../../shared/components/ui'
import { todayISO } from '../../../shared/utils/formatDate'
import { CompleteForm } from '../components/CompleteForm'
import { HistoryList } from '../components/HistoryList'
import { ItemCard } from '../components/ItemCard'
import { ItemForm } from '../components/ItemForm'
import { SummaryBar } from '../components/SummaryBar'
import { useReminderItems } from '../hooks/useReminderItems'
import type { ReminderItem } from '../types/reminder'
import { summarizeNextMonth } from '../utils/costSummary'
import { isReminding } from '../utils/reminders'
import { compareItems } from '../utils/sort'
import { daysLeft } from '../utils/urgency'
import { isUsageReached } from '../utils/usage'

type Tab = 'active' | 'archived'
type FormState = { mode: 'create' } | { mode: 'edit'; item: ReminderItem } | null

export default function ExpiryTrackerPage() {
  const { items, loading, firstLoad, error, reload, addItem, editItem, removeItem, completeItem } = useReminderItems()
  const [tab, setTab] = useState<Tab>('active')
  const [form, setForm] = useState<FormState>(null)
  const [completing, setCompleting] = useState<ReminderItem | null>(null)
  const [historyOf, setHistoryOf] = useState<ReminderItem | null>(null)
  const [deleting, setDeleting] = useState<ReminderItem | null>(null)
  const [deletingBusy, setDeletingBusy] = useState(false)

  const today = todayISO()
  const active = items.filter((i) => i.archived_at === null)
  const archived = items.filter((i) => i.archived_at !== null)

  const overdueCount = active.filter((i) => daysLeft(i.due_date, today) < 0).length
  const remindingCount = active.filter((i) => isUsageReached(i) || isReminding(daysLeft(i.due_date, today), i.remind_before_days)).length
  const cost = summarizeNextMonth(items, today)

  const source = tab === 'active' ? active : archived
  const visible = [...source].sort(tab === 'active' ? compareItems : (a, b) => (b.archived_at ?? '').localeCompare(a.archived_at ?? ''))

  const confirmDelete = async () => {
    if (!deleting) return
    setDeletingBusy(true)
    await removeItem(deleting.id)
    setDeletingBusy(false)
    setDeleting(null)
  }

  const tabButton = (id: Tab, label: string, count: number) => (
    <Button variant={tab === id ? 'primary' : 'secondary'} size="sm" aria-pressed={tab === id} onClick={() => setTab(id)}>
      {label} ({count.toLocaleString('th-TH')})
    </Button>
  )

  return (
    <>
      <PageHeader>
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-xl font-semibold text-gray-900">อย่าลืมฉัน</h1>
          <Button onClick={() => setForm({ mode: 'create' })}>
            <Plus className="h-4 w-4" />
            เพิ่มรายการ
          </Button>
        </div>
      </PageHeader>

      <div className="mx-auto mt-4 flex max-w-3xl flex-col gap-4">
        {firstLoad && loading ? (
          <Spinner />
        ) : error ? (
          <ErrorState title="โหลดรายการไม่สำเร็จ" description={error} onRetry={reload} />
        ) : (
          <>
            <SummaryBar overdueCount={overdueCount} remindingCount={remindingCount} cost={cost} />

            <div className="flex gap-2">
              {tabButton('active', 'ใช้งานอยู่', active.length)}
              {tabButton('archived', 'เก็บถาวร', archived.length)}
            </div>

            {visible.length === 0 ? (
              <EmptyState
                title={tab === 'active' ? 'ยังไม่มีรายการ' : 'ยังไม่มีรายการที่เก็บถาวร'}
                description={
                  tab === 'active' ? 'กดปุ่ม “เพิ่มรายการ” ด้านบน เพื่อเพิ่มเอกสาร ของใช้ หรือค่าสมาชิกที่ไม่อยากลืม' : undefined
                }
              />
            ) : (
              <ul className="flex flex-col gap-2">
                {visible.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    today={today}
                    onComplete={setCompleting}
                    onHistory={setHistoryOf}
                    onEdit={(i) => setForm({ mode: 'edit', item: i })}
                    onDelete={setDeleting}
                  />
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      <Modal open={form !== null} title={form?.mode === 'edit' ? 'แก้ไขรายการ' : 'เพิ่มรายการ'} onClose={() => setForm(null)}>
        {form && (
          <ItemForm
            key={form.mode === 'edit' ? form.item.id : 'create'}
            item={form.mode === 'edit' ? form.item : undefined}
            onSubmit={(values) => (form.mode === 'edit' ? editItem(form.item.id, values) : addItem(values))}
            onCancel={() => setForm(null)}
          />
        )}
      </Modal>

      <Modal open={completing !== null} title="ทำแล้ว" onClose={() => setCompleting(null)}>
        {completing && (
          <CompleteForm
            key={completing.id}
            item={completing}
            onSubmit={(values) => completeItem(completing.id, values)}
            onCancel={() => setCompleting(null)}
          />
        )}
      </Modal>

      <Modal open={historyOf !== null} title={historyOf ? `ประวัติ: ${historyOf.name}` : 'ประวัติ'} onClose={() => setHistoryOf(null)}>
        {historyOf && <HistoryList key={historyOf.id} item={historyOf} />}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="ลบรายการ"
        message={deleting ? `ลบ “${deleting.name}” ใช่ไหม ประวัติของรายการนี้จะถูกลบไปด้วยและกู้คืนไม่ได้` : ''}
        loading={deletingBusy}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleting(null)}
      />
    </>
  )
}
