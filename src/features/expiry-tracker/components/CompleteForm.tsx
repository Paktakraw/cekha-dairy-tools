import { useState, type FormEvent } from 'react'
import { FormActions, Input, Textarea } from '../../../shared/components/ui'
import { todayISO } from '../../../shared/utils/formatDate'
import { NOTE_MAX_LENGTH, PROVIDER_NAME_MAX_LENGTH, PROVIDER_PHONE_MAX_LENGTH } from '../constants'
import type { CompleteFieldErrors, CompleteFormInput, CompleteValues, ReminderItem } from '../types/reminder'
import { nextDueAfterDone } from '../utils/schedule'
import { validateComplete } from '../utils/validation'

interface CompleteFormProps {
  item: ReminderItem
  /** คืนข้อความ error หรือ null เมื่อสำเร็จ */
  onSubmit: (values: CompleteValues) => Promise<string | null>
  onCancel: () => void
}

export function CompleteForm({ item, onSubmit, onCancel }: CompleteFormProps) {
  const today = todayISO()
  const [input, setInput] = useState<CompleteFormInput>({
    doneOn: today,
    cost: item.cost === null ? '' : String(item.cost),
    providerName: item.provider_name ?? '',
    providerPhone: item.provider_phone ?? '',
    note: '',
    usageValue: item.usage_current === null ? '' : String(item.usage_current),
    nextDue: nextDueAfterDone(item, today) ?? '',
  })
  // แก้วันครบกำหนดครั้งถัดไปเองแล้ว = เปลี่ยนวันที่ทำก็ไม่คำนวณทับ
  const [nextTouched, setNextTouched] = useState(false)
  const [errors, setErrors] = useState<CompleteFieldErrors>({})
  const [formError, setFormError] = useState<string>()
  const [saving, setSaving] = useState(false)

  const patch = (changes: Partial<CompleteFormInput>) => setInput((prev) => ({ ...prev, ...changes }))

  const changeDoneOn = (doneOn: string) => {
    patch(nextTouched || doneOn === '' ? { doneOn } : { doneOn, nextDue: nextDueAfterDone(item, doneOn) ?? '' })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const { errors: found, values } = validateComplete(input, item)
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
      <p className="text-sm text-gray-600">
        บันทึกว่าทำ “{item.name}” แล้ว ระบบจะเก็บลงประวัติ และเลื่อนวันครบกำหนดหรือเก็บถาวรตามที่ระบุด้านล่าง
      </p>
      <Input label="วันที่ทำ" type="date" value={input.doneOn} error={errors.doneOn} onChange={(e) => changeDoneOn(e.target.value)} />
      <Input
        label="ค่าใช้จ่ายจริง (บาท)"
        inputMode="decimal"
        placeholder="ไม่ระบุก็ได้"
        value={input.cost}
        error={errors.cost}
        onChange={(e) => patch({ cost: e.target.value })}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label="ช่าง/ผู้ให้บริการ"
          value={input.providerName}
          error={errors.providerName}
          maxLength={PROVIDER_NAME_MAX_LENGTH}
          onChange={(e) => patch({ providerName: e.target.value })}
        />
        <Input
          label="เบอร์โทร"
          type="tel"
          value={input.providerPhone}
          error={errors.providerPhone}
          maxLength={PROVIDER_PHONE_MAX_LENGTH}
          onChange={(e) => patch({ providerPhone: e.target.value })}
        />
      </div>
      {item.usage_unit !== null && (
        <Input
          label={`ค่าระยะตอนทำ (${item.usage_unit})`}
          inputMode="decimal"
          value={input.usageValue}
          error={errors.usageValue}
          onChange={(e) => patch({ usageValue: e.target.value })}
        />
      )}
      <Input
        label="วันครบกำหนดครั้งถัดไป"
        type="date"
        value={input.nextDue}
        error={errors.nextDue}
        hint="เว้นว่าง = เก็บถาวร"
        onChange={(e) => {
          setNextTouched(true)
          patch({ nextDue: e.target.value })
        }}
      />
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
      {input.nextDue === '' && (
        <p className="text-sm text-gray-600">ไม่ได้ระบุวันครบกำหนดครั้งถัดไป รายการนี้จะถูกย้ายไปแท็บ “เก็บถาวร” (ยังดูประวัติได้)</p>
      )}
      <FormActions saving={saving} onCancel={onCancel} />
    </form>
  )
}
