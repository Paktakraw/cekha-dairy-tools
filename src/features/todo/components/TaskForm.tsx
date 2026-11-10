import { useState, type FormEvent } from 'react'
import { FormActions, Input, Textarea } from '../../../shared/components/ui'
import { DESCRIPTION_MAX_LENGTH, DUPLICATE_TITLE_MESSAGE, TITLE_MAX_LENGTH } from '../constants'
import type { Task, TaskInput } from '../types/task'

interface TaskFormProps {
  /** ถ้ามี = โหมดแก้ไข */
  task?: Task
  /** คืนข้อความ error หรือ null เมื่อสำเร็จ */
  onSubmit: (input: TaskInput) => Promise<string | null>
  onCancel: () => void
}

export function TaskForm({ task, onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [titleError, setTitleError] = useState<string>()
  const [formError, setFormError] = useState<string>()
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (title.trim() === '') {
      setTitleError('กรุณากรอกชื่องาน')
      return
    }
    setSaving(true)
    setFormError(undefined)
    const error = await onSubmit({ title, description })
    setSaving(false)
    if (error === null) {
      onCancel()
    } else if (error === DUPLICATE_TITLE_MESSAGE) {
      setTitleError(error)
    } else {
      setFormError(error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <Input
        label="ชื่องาน"
        value={title}
        error={titleError}
        hint={`${title.length}/${TITLE_MAX_LENGTH}`}
        maxLength={TITLE_MAX_LENGTH}
        autoFocus
        onChange={(e) => {
          setTitle(e.target.value)
          setTitleError(undefined)
        }}
      />
      <Textarea
        label="รายละเอียด (ไม่บังคับ)"
        value={description}
        hint={`${description.length}/${DESCRIPTION_MAX_LENGTH}`}
        maxLength={DESCRIPTION_MAX_LENGTH}
        onChange={(e) => setDescription(e.target.value)}
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
