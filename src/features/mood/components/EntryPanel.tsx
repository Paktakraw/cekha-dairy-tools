import { useState, type FormEvent } from 'react'
import { Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button, FormActions, Textarea } from '../../../shared/components/ui'
import { NOTE_MAX_LENGTH, SETTINGS_PATH, TAG_GROUPS, TAG_GROUP_LABELS, moodMeta } from '../constants'
import type { DetailValues, MoodEntry, MoodScore, MoodTag } from '../types/mood'
import { normalizeDetails } from '../utils/validation'
import { MoodPicker } from './MoodPicker'

interface EntryPanelProps {
  date: string
  entry: MoodEntry | undefined
  /** แท็กของผู้ใช้ทั้งหมด */
  tags: MoodTag[]
  onPickMood: (score: MoodScore) => Promise<string | null>
  onSaveDetails: (mood: MoodScore, details: DetailValues) => Promise<string | null>
  onDelete: () => void
}

/** เช็กอินของวันหนึ่ง: เลือกอารมณ์ (บันทึกทันที) แล้วเลือกแท็ก/พิมพ์ข้อความสั้น ๆ (กดบันทึก) */
export function EntryPanel({ date, entry, tags, onPickMood, onSaveDetails, onDelete }: EntryPanelProps) {
  const [busy, setBusy] = useState(false)

  const pick = async (score: MoodScore) => {
    setBusy(true)
    await onPickMood(score)
    setBusy(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <MoodPicker value={entry?.mood ?? null} disabled={busy} onPick={pick} />
      {entry && (
        <>
          <p className="text-sm text-gray-600">
            {moodMeta(entry.mood).emoji} {moodMeta(entry.mood).meaning}
          </p>
          {/* key = id ของรายการ: เปลี่ยนวัน/รายการใหม่แล้วรีเซ็ตฟอร์ม แต่เปลี่ยนอารมณ์ของรายการเดิมไม่ล้างสิ่งที่พิมพ์ค้าง */}
          <DetailsForm key={`${date}:${entry.id}`} entry={entry} allTags={tags} onSave={onSaveDetails} onDelete={onDelete} />
        </>
      )}
    </div>
  )
}

interface DetailsFormProps {
  entry: MoodEntry
  allTags: MoodTag[]
  onSave: (mood: MoodScore, details: DetailValues) => Promise<string | null>
  onDelete: () => void
}

function DetailsForm({ entry, allTags, onSave, onDelete }: DetailsFormProps) {
  const [tags, setTags] = useState<string[]>(entry.tags)
  const [note, setNote] = useState(entry.note ?? '')
  const [error, setError] = useState<string>()
  const [saving, setSaving] = useState(false)

  const toggle = (id: string) => setTags((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const { values, error: found } = normalizeDetails(
      tags,
      note,
      allTags.map((t) => t.id),
    )
    if (values === null) {
      setError(found ?? undefined)
      return
    }
    setSaving(true)
    setError(undefined)
    const failure = await onSave(entry.mood, values)
    setSaving(false)
    if (failure !== null) setError(failure)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {allTags.length === 0 && (
        <p className="text-sm text-gray-500">
          ยังไม่มีแท็ก เพิ่มได้ที่{' '}
          <Link to={SETTINGS_PATH} className="underline">
            แท็บตั้งค่า
          </Link>
        </p>
      )}
      {TAG_GROUPS.map((group) => (
        <fieldset key={group} className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-medium text-gray-700">{TAG_GROUP_LABELS[group]}</legend>
          <div className="flex flex-wrap gap-2">
            {allTags.filter((t) => t.group_kind === group).map((tag) => {
              const on = tags.includes(tag.id)
              return (
                <button
                  key={tag.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(tag.id)}
                  className={`rounded-full border px-3 py-1 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-gray-900 ${
                    on ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {tag.name}
                </button>
              )
            })}
          </div>
        </fieldset>
      ))}
      <Textarea
        label="อยากระบายสั้น ๆ ไหม (ไม่บังคับ)"
        rows={2}
        value={note}
        maxLength={NOTE_MAX_LENGTH}
        hint={`${note.length}/${NOTE_MAX_LENGTH}`}
        error={error}
        onChange={(e) => setNote(e.target.value.replace(/\n/g, ' '))}
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button variant="secondary" onClick={onDelete} disabled={saving}>
          <Trash2 className="h-4 w-4" />
          ลบการเช็กอิน
        </Button>
        <FormActions saving={saving} />
      </div>
    </form>
  )
}
