import { useState } from 'react'
import { BellRing } from 'lucide-react'
import { ConfirmDialog, ErrorState, Spinner } from '../../../shared/components/ui'
import { formatDateLong, todayISO } from '../../../shared/utils/formatDate'
import { EntryPanel } from '../components/EntryPanel'
import { VibeBoostCard } from '../components/VibeBoostCard'
import { LOW_STREAK_DAYS, OVERWHELMED_SCORE, isLowMood } from '../constants'
import { useMoodEntries } from '../hooks/useMoodEntries'
import { addDays } from '../utils/calendar'
import { consecutiveDaysWithMood } from '../utils/stats'

export default function TodayPage() {
  const today = todayISO()
  // ดึงย้อนหลังพอสำหรับนับวันดิ่งต่อเนื่อง
  const { entries, loading, firstLoad, error, reload, setMood, saveDetails, removeEntry } = useMoodEntries(addDays(today, -(LOW_STREAK_DAYS - 1)), today)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  if (firstLoad && loading) return <Spinner />
  if (error) return <ErrorState title="โหลดการเช็กอินไม่สำเร็จ" description={error} onRetry={reload} />

  const entry = entries.find((e) => e.entry_date === today)
  const lowStreak = consecutiveDaysWithMood(entries, OVERWHELMED_SCORE, today) >= LOW_STREAK_DAYS

  const handleDelete = async () => {
    if (!entry) return
    setDeleting(true)
    await removeEntry(entry.id)
    setDeleting(false)
    setConfirmDelete(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-gray-600">วันนี้ {formatDateLong(today)} รู้สึกยังไงบ้าง?</p>
      {!entry && !loading && (
        <p role="status" className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800">
          <BellRing className="h-4 w-4 shrink-0" />
          วันนี้ยังไม่ได้เช็กอิน แตะอิโมจิด้านล่างได้เลย
        </p>
      )}
      <EntryPanel
        date={today}
        entry={entry}
        onPickMood={(score) => setMood(today, score)}
        onSaveDetails={(mood, details) => saveDetails(today, mood, details)}
        onDelete={() => setConfirmDelete(true)}
      />
      {entry && isLowMood(entry.mood) && <VibeBoostCard key={entry.mood} level={entry.mood} showCare={entry.mood === OVERWHELMED_SCORE && lowStreak} />}
      <ConfirmDialog
        open={confirmDelete}
        title="ลบการเช็กอินวันนี้"
        message="ลบอารมณ์ แท็ก และข้อความของวันนี้ใช่ไหม"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  )
}
