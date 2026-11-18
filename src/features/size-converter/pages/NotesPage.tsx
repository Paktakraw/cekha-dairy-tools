import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { Button, ConfirmDialog, EmptyState, ErrorState, IconButton, Input, Modal, Spinner } from '../../../shared/components/ui'
import { NoteForm } from '../components/NoteForm'
import { ProfileSelect } from '../components/ProfileSelect'
import { FIT_LABELS } from '../constants'
import { useSizeContext } from '../hooks/useSizeContext'
import { useSizeNotes } from '../hooks/useSizeNotes'
import type { SizeNote } from '../types/size'

type FormState = { mode: 'create' } | { mode: 'edit'; note: SizeNote } | null

export default function NotesPage() {
  const { profiles, selected, selectProfile } = useSizeContext()
  const { notes, loading, firstLoad, error, reload, addNote, editNote, removeNote } = useSizeNotes()
  const [search, setSearch] = useState('')
  const [form, setForm] = useState<FormState>(null)
  const [deleting, setDeleting] = useState<SizeNote | null>(null)
  const [deletingBusy, setDeletingBusy] = useState(false)

  if (selected === null) {
    return <EmptyState title="ยังไม่มีโปรไฟล์" description="สร้างโปรไฟล์ที่แท็บ “โปรไฟล์” ก่อน แล้วจึงจดไซส์ที่เคยใส่ได้จริงได้" />
  }

  const keyword = search.trim().toLowerCase()
  const visible = notes.filter((n) => n.profile_id === selected.id && (keyword === '' || n.brand.toLowerCase().includes(keyword)))

  const confirmDelete = async () => {
    if (!deleting) return
    setDeletingBusy(true)
    await removeNote(deleting.id)
    setDeletingBusy(false)
    setDeleting(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0 flex-1 sm:max-w-xs">
          <ProfileSelect profiles={profiles} value={selected.id} onChange={selectProfile} />
        </div>
        <Button onClick={() => setForm({ mode: 'create' })}>
          <Plus className="h-4 w-4" />
          เพิ่มบันทึก
        </Button>
      </div>

      {firstLoad && loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState title="โหลดบันทึกไม่สำเร็จ" description={error} onRetry={reload} />
      ) : (
        <>
          <Input label="ค้นหาตามแบรนด์" value={search} onChange={(e) => setSearch(e.target.value)} />
          {visible.length === 0 ? (
            <EmptyState
              title={keyword ? 'ไม่พบบันทึกของแบรนด์นี้' : 'ยังไม่มีบันทึกไซส์'}
              description={keyword ? undefined : 'กดปุ่ม “เพิ่มบันทึก” ด้านบน เพื่อจดไซส์ที่เคยใส่ได้จริง เช่น Nike Air Force 1 ใส่ US 9'}
            />
          ) : (
            <ul className="flex flex-col gap-2">
              {visible.map((n) => (
                <li key={n.id} className="flex items-start justify-between gap-2 rounded-lg border border-gray-200 bg-white p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {n.brand}
                      {n.product ? ` · ${n.product}` : ''}
                    </p>
                    <p className="mt-1 text-sm text-gray-700">
                      ไซส์ {n.size_label} <span className="text-xs text-gray-500">({FIT_LABELS[n.fit]})</span>
                    </p>
                    {n.note && <p className="mt-1 text-xs break-words whitespace-pre-wrap text-gray-600">{n.note}</p>}
                  </div>
                  <div className="flex shrink-0">
                    <IconButton icon={Pencil} label="แก้ไขบันทึก" onClick={() => setForm({ mode: 'edit', note: n })} />
                    <IconButton icon={Trash2} label="ลบบันทึก" tone="danger" onClick={() => setDeleting(n)} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <Modal open={form !== null} title={form?.mode === 'edit' ? 'แก้ไขบันทึก' : 'เพิ่มบันทึก'} onClose={() => setForm(null)}>
        {form && (
          <NoteForm
            key={form.mode === 'edit' ? form.note.id : 'create'}
            profileId={selected.id}
            note={form.mode === 'edit' ? form.note : undefined}
            onSubmit={(values) => (form.mode === 'edit' ? editNote(form.note.id, values) : addNote(values))}
            onCancel={() => setForm(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="ลบบันทึก"
        message={deleting ? `ลบบันทึก “${deleting.brand}” ใช่ไหม` : ''}
        loading={deletingBusy}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
