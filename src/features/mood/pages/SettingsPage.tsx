import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Button, ConfirmDialog, IconButton, Modal } from '../../../shared/components/ui'
import { TagForm } from '../components/TagForm'
import { MAX_TAGS, TAG_GROUPS, TAG_GROUP_LABELS } from '../constants'
import { useMoodContext } from '../hooks/useMoodContext'
import type { MoodTag, MoodTagGroup } from '../types/mood'
import { canAddTag } from '../utils/tagValidation'

type FormState = { mode: 'create'; group: MoodTagGroup } | { mode: 'edit'; tag: MoodTag } | null

/** ตั้งค่าแท็ก: เพิ่ม/แก้ชื่อ/ลบ แท็กเรื่องราวและกิจกรรม */
export default function SettingsPage() {
  const { tags, addTag, renameTag, removeTag } = useMoodContext()
  const [form, setForm] = useState<FormState>(null)
  const [deleting, setDeleting] = useState<MoodTag | null>(null)
  const [deletingBusy, setDeletingBusy] = useState(false)

  const canAdd = canAddTag(tags)

  const confirmDelete = async () => {
    if (!deleting) return
    setDeletingBusy(true)
    await removeTag(deleting.id)
    setDeletingBusy(false)
    setDeleting(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-gray-600">
        จัดการแท็กที่ใช้ตอนเช็กอิน เพิ่มได้สูงสุด {MAX_TAGS} แท็ก (ตอนนี้มี {tags.length.toLocaleString('th-TH')})
        {!canAdd && ' — ครบแล้ว ลบบางอันก่อนจึงจะเพิ่มได้'}
      </p>
      {TAG_GROUPS.map((group) => {
        const groupTags = tags.filter((t) => t.group_kind === group)
        return (
          <section key={group} aria-label={`แท็ก${TAG_GROUP_LABELS[group]}`} className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-medium text-gray-900">{TAG_GROUP_LABELS[group]}</h2>
              <Button size="sm" disabled={!canAdd} onClick={() => setForm({ mode: 'create', group })}>
                <Plus className="h-4 w-4" />
                เพิ่ม
              </Button>
            </div>
            {groupTags.length === 0 ? (
              <p className="text-sm text-gray-500">ยังไม่มีแท็กในกลุ่มนี้</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {groupTags.map((tag) => (
                  <li key={tag.id} className="flex items-center justify-between gap-2 rounded-md border border-gray-200 bg-white px-3 py-1.5">
                    <span className="min-w-0 flex-1 truncate text-sm text-gray-800">{tag.name}</span>
                    <div className="flex shrink-0 gap-1">
                      <IconButton icon={Pencil} label={`แก้ชื่อแท็ก ${tag.name}`} size="sm" onClick={() => setForm({ mode: 'edit', tag })} />
                      <IconButton icon={Trash2} label={`ลบแท็ก ${tag.name}`} size="sm" tone="danger" onClick={() => setDeleting(tag)} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )
      })}

      <Modal
        open={form !== null}
        title={form?.mode === 'edit' ? 'แก้ชื่อแท็ก' : 'เพิ่มแท็ก'}
        onClose={() => setForm(null)}
      >
        {form && (
          <TagForm
            group={form.mode === 'edit' ? form.tag.group_kind : form.group}
            tag={form.mode === 'edit' ? form.tag : undefined}
            existing={tags}
            onSubmit={(name) => (form.mode === 'edit' ? renameTag(form.tag.id, name) : addTag(form.group, name))}
            onCancel={() => setForm(null)}
          />
        )}
      </Modal>
      <ConfirmDialog
        open={deleting !== null}
        title="ลบแท็ก"
        message={`ลบแท็ก “${deleting?.name ?? ''}” ใช่ไหม แท็กนี้จะถูกถอดออกจากการเช็กอินเก่าทุกวันด้วย (สรุปรายเดือนของเดือนเก่าจะไม่นับแท็กนี้)`}
        loading={deletingBusy}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
