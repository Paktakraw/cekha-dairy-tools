import { useState, type FormEvent } from 'react'
import { FormActions, Input, Select, Textarea } from '../../../shared/components/ui'
import { BRAND_MAX_LENGTH, FIT_LABELS, NOTE_MAX_LENGTH, PRODUCT_MAX_LENGTH, SIZE_LABEL_MAX_LENGTH } from '../constants'
import type { FitFeel, NoteFieldErrors, NoteFormInput, NoteValues, SizeNote } from '../types/size'
import { validateNote } from '../utils/validation'

interface NoteFormProps {
  profileId: string
  /** ถ้ามี = โหมดแก้ไข */
  note?: SizeNote
  onSubmit: (values: NoteValues) => Promise<string | null>
  onCancel: () => void
}

export function NoteForm({ profileId, note, onSubmit, onCancel }: NoteFormProps) {
  const [input, setInput] = useState<NoteFormInput>({
    brand: note?.brand ?? '',
    product: note?.product ?? '',
    sizeLabel: note?.size_label ?? '',
    fit: note?.fit ?? 'good',
    note: note?.note ?? '',
  })
  const [errors, setErrors] = useState<NoteFieldErrors>({})
  const [formError, setFormError] = useState<string>()
  const [saving, setSaving] = useState(false)

  const patch = (changes: Partial<NoteFormInput>) => setInput((prev) => ({ ...prev, ...changes }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const { errors: found, values } = validateNote(input, note?.profile_id ?? profileId)
    setErrors(found)
    if (values === null) return

    setSaving(true)
    setFormError(undefined)
    const error = await onSubmit(values)
    setSaving(false)

    if (error === null) onCancel()
    else setFormError(error)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <Input label="แบรนด์" value={input.brand} error={errors.brand} maxLength={BRAND_MAX_LENGTH} autoFocus onChange={(e) => patch({ brand: e.target.value })} />
      <Input
        label="สินค้า/รุ่น (ไม่บังคับ)"
        value={input.product}
        error={errors.product}
        maxLength={PRODUCT_MAX_LENGTH}
        onChange={(e) => patch({ product: e.target.value })}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="ไซส์ที่ใส่"
          placeholder="เช่น US 9, M"
          value={input.sizeLabel}
          error={errors.sizeLabel}
          maxLength={SIZE_LABEL_MAX_LENGTH}
          onChange={(e) => patch({ sizeLabel: e.target.value })}
        />
        <Select label="ความรู้สึก" value={input.fit} onChange={(e) => patch({ fit: e.target.value as FitFeel })}>
          {(Object.keys(FIT_LABELS) as FitFeel[]).map((f) => (
            <option key={f} value={f}>
              {FIT_LABELS[f]}
            </option>
          ))}
        </Select>
      </div>
      <Textarea
        label="หมายเหตุ"
        value={input.note}
        error={errors.note}
        hint={`${input.note.length}/${NOTE_MAX_LENGTH}`}
        maxLength={NOTE_MAX_LENGTH}
        onChange={(e) => patch({ note: e.target.value })}
      />
      {formError && (
        <p role="alert" className="text-sm text-red-700">
          {formError}
        </p>
      )}
      <FormActions saving={saving} onCancel={onCancel} />
    </form>
  )
}
