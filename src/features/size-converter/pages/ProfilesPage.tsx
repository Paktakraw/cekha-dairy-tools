import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { createPortal } from 'react-dom'
import { ConfirmDialog, EmptyState, IconButton, Modal } from '../../../shared/components/ui'
import { ProfileForm } from '../components/ProfileForm'
import { DEMOGRAPHIC_LABELS, MEASURE_FIELDS } from '../constants'
import { useSizeContext } from '../hooks/useSizeContext'
import type { SizeProfile } from '../types/size'
import { cmToInch } from '../utils/units'

type FormState = { mode: 'create' } | { mode: 'edit'; profile: SizeProfile } | null

function summary(profile: SizeProfile): string {
  const parts: string[] = []
  for (const field of MEASURE_FIELDS) {
    const value = profile[field.key]
    if (value === null) continue
    const inch = field.unit === 'length' && profile.unit_pref === 'inch'
    parts.push(`${field.label} ${inch ? `${cmToInch(value)} นิ้ว` : `${value} ${field.unit === 'mm' ? 'mm' : 'cm'}`}`)
  }
  return parts.length > 0 ? parts.join(' · ') : 'ยังไม่ได้กรอกสัดส่วน'
}

export default function ProfilesPage() {
  const { profiles, addProfile, editProfile, removeProfile, actionSlot } = useSizeContext()
  const [form, setForm] = useState<FormState>(null)
  const [deleting, setDeleting] = useState<SizeProfile | null>(null)
  const [deletingBusy, setDeletingBusy] = useState(false)

  const confirmDelete = async () => {
    if (!deleting) return
    setDeletingBusy(true)
    await removeProfile(deleting.id)
    setDeletingBusy(false)
    setDeleting(null)
  }

  return (
    <div className="flex flex-col gap-4">
      {actionSlot &&
        createPortal(
          // สไตล์เดียวกับปุ่มแท็บ (ตัวแปลง/โปรไฟล์/จดไซส์) ที่ไม่ได้เลือก
          <button
            type="button"
            onClick={() => setForm({ mode: 'create' })}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm whitespace-nowrap text-gray-700 transition-colors hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-gray-900 sm:w-auto"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span className="truncate">เพิ่มโปรไฟล์</span>
          </button>,
          actionSlot,
        )}

      {profiles.length === 0 ? (
        <EmptyState title="ยังไม่มีโปรไฟล์" description="กดปุ่ม “เพิ่มโปรไฟล์” ด้านบน เพื่อบันทึกสัดส่วนของตัวเองหรือคนรอบตัว" />
      ) : (
        <ul className="flex flex-col gap-2">
          {profiles.map((profile) => (
            <li key={profile.id} className="flex items-start justify-between gap-2 rounded-lg border border-gray-200 bg-white p-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {profile.name}
                  <span className="ml-2 text-xs font-normal text-gray-500">ตารางไซส์{DEMOGRAPHIC_LABELS[profile.demographic]}</span>
                </p>
                <p className="mt-1 text-xs text-gray-600">{summary(profile)}</p>
              </div>
              <div className="flex shrink-0">
                <IconButton icon={Pencil} label="แก้ไขโปรไฟล์" onClick={() => setForm({ mode: 'edit', profile })} />
                <IconButton icon={Trash2} label="ลบโปรไฟล์" tone="danger" onClick={() => setDeleting(profile)} />
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal open={form !== null} title={form?.mode === 'edit' ? 'แก้ไขโปรไฟล์' : 'เพิ่มโปรไฟล์'} onClose={() => setForm(null)}>
        {form && (
          <ProfileForm
            key={form.mode === 'edit' ? form.profile.id : 'create'}
            profile={form.mode === 'edit' ? form.profile : undefined}
            onSubmit={(values) => (form.mode === 'edit' ? editProfile(form.profile.id, values) : addProfile(values))}
            onCancel={() => setForm(null)}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="ลบโปรไฟล์"
        message={deleting ? `ลบ “${deleting.name}” ใช่ไหม บันทึกไซส์ของโปรไฟล์นี้จะถูกลบไปด้วยและกู้คืนไม่ได้` : ''}
        loading={deletingBusy}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
