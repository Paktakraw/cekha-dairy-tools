import { useState } from 'react'
import { ErrorState, ConfirmDialog, Modal, Spinner } from '../../../shared/components/ui'
import { formatDateLong, todayISO } from '../../../shared/utils/formatDate'
import type { DetailValues, MoodScore } from '../types/mood'
import { EntryPanel } from '../components/EntryPanel'
import { MonthNav } from '../components/MonthNav'
import { MoodCalendar } from '../components/MoodCalendar'
import { useMoodContext } from '../hooks/useMoodContext'
import { useMoodEntries } from '../hooks/useMoodEntries'
import { monthKeyOf, monthRange } from '../utils/calendar'

export default function CalendarPage() {
  const { tags } = useMoodContext()
  const today = todayISO()
  const currentMonth = monthKeyOf(today)
  const [month, setMonth] = useState(currentMonth)
  const [picked, setPicked] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const { from, to } = monthRange(month)
  const { entries, loading, firstLoad, error, reload, setMood, saveDetails, removeEntry } = useMoodEntries(from, to)

  const entry = picked ? entries.find((e) => e.entry_date === picked) : undefined

  // บันทึกสำเร็จแล้วปิด Popup กลับมาที่ปฏิทิน (ถ้าล้มเหลวค้างไว้พร้อมข้อความ error)
  const handleSaveDetails = async (date: string, mood: MoodScore, details: DetailValues): Promise<string | null> => {
    const failure = await saveDetails(date, mood, details)
    if (failure === null) setPicked(null)
    return failure
  }

  const handleDelete = async () => {
    if (!entry) return
    setDeleting(true)
    const ok = await removeEntry(entry.id)
    setDeleting(false)
    setConfirmDelete(false)
    if (ok) setPicked(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <MonthNav month={month} currentMonth={currentMonth} onChange={setMonth} />
      {firstLoad && loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState title="โหลดปฏิทินไม่สำเร็จ" description={error} onRetry={reload} />
      ) : (
        <>
          <MoodCalendar month={month} entries={entries} today={today} onPickDate={setPicked} />
          {entries.length === 0 && <p className="text-center text-sm text-gray-500">เดือนนี้ยังไม่มีการเช็กอิน กดวันที่ในปฏิทินเพื่อเพิ่มย้อนหลังได้</p>}
        </>
      )}
      <Modal open={picked !== null} title={picked ? formatDateLong(picked) : ''} onClose={() => setPicked(null)}>
        {picked && (
          <EntryPanel
            date={picked}
            entry={entry}
            tags={tags}
            onPickMood={(score) => setMood(picked, score)}
            onSaveDetails={(mood, details) => handleSaveDetails(picked, mood, details)}
            onDelete={() => setConfirmDelete(true)}
          />
        )}
      </Modal>
      <ConfirmDialog
        open={confirmDelete}
        title="ลบการเช็กอิน"
        message="ลบอารมณ์ แท็ก และข้อความของวันนั้นใช่ไหม"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  )
}
