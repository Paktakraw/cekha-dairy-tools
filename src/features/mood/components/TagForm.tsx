import { useState, type FormEvent } from 'react'
import { FormActions, Input } from '../../../shared/components/ui'
import { TAG_GROUP_LABELS, TAG_NAME_MAX_LENGTH } from '../constants'
import type { MoodTag, MoodTagGroup } from '../types/mood'
import { validateTagName } from '../utils/tagValidation'

interface TagFormProps {
  group: MoodTagGroup
  /** ถ้ามี = โหมดแก้ชื่อ */
  tag?: MoodTag
  /** แท็กทั้งหมดของผู้ใช้ (ใช้ตรวจชื่อซ้ำ) */
  existing: MoodTag[]
  /** คืนข้อความ error หรือ null เมื่อสำเร็จ */
  onSubmit: (name: string) => Promise<string | null>
  onCancel: () => void
}

export function TagForm({ group, tag, existing, onSubmit, onCancel }: TagFormProps) {
  const [name, setName] = useState(tag?.name ?? '')
  const [error, setError] = useState<string>()
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const result = validateTagName(name, group, existing, tag?.id)
    if (result.name === null) {
      setError(result.error ?? undefined)
      return
    }
    setSaving(true)
    setError(undefined)
    const failure = await onSubmit(result.name)
    setSaving(false)
    if (failure === null) onCancel()
    else setError(failure)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <Input
        label={`ชื่อแท็กกลุ่ม${TAG_GROUP_LABELS[group]}`}
        value={name}
        error={error}
        hint={`${name.length}/${TAG_NAME_MAX_LENGTH}`}
        maxLength={TAG_NAME_MAX_LENGTH}
        autoFocus
        onChange={(e) => setName(e.target.value)}
      />
      <FormActions saving={saving} onCancel={onCancel} />
    </form>
  )
}
