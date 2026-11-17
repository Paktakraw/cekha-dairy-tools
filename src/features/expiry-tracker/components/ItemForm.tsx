import { useState, type FormEvent } from 'react'
import { FormActions, Input, Select, Textarea } from '../../../shared/components/ui'
import { formatDateLong, todayISO } from '../../../shared/utils/formatDate'
import {
  CATEGORIES,
  DAYS_AHEAD_MAX,
  NAME_MAX_LENGTH,
  NOTE_MAX_LENGTH,
  PROVIDER_NAME_MAX_LENGTH,
  PROVIDER_PHONE_MAX_LENGTH,
  REMIND_PRESETS,
  REPEAT_UNIT_LABELS,
  USAGE_UNIT_MAX_LENGTH,
  categoryFields,
} from '../constants'
import type { ItemFieldErrors, ItemFormInput, ItemValues, ReminderCategory, ReminderItem, RepeatUnit } from '../types/reminder'
import { daysAheadOf, dueDateFromDaysAhead } from '../utils/dates'
import { validateItem } from '../utils/validation'
import { RemindDaysField } from './RemindDaysField'

interface ItemFormProps {
  /** ถ้ามี = โหมดแก้ไข */
  item?: ReminderItem
  /** คืนข้อความ error หรือ null เมื่อสำเร็จ */
  onSubmit: (values: ItemValues) => Promise<string | null>
  onCancel: () => void
}

const text = (value: number | null): string => (value === null ? '' : String(value))

function initialInput(item?: ReminderItem): ItemFormInput {
  if (!item) {
    return {
      category: 'document',
      name: '',
      dueDate: '',
      repeatEvery: '',
      repeatUnit: 'month',
      remindBeforeDays: REMIND_PRESETS.document,
      cost: '',
      providerName: '',
      providerPhone: '',
      note: '',
      usageEnabled: false,
      usageUnit: 'กม.',
      usageInterval: '',
      usageLastDone: '',
      usageCurrent: '',
    }
  }
  return {
    category: item.category,
    name: item.name,
    dueDate: item.due_date,
    repeatEvery: text(item.repeat_every),
    repeatUnit: item.repeat_unit ?? 'month',
    remindBeforeDays: item.remind_before_days,
    cost: text(item.cost),
    providerName: item.provider_name ?? '',
    providerPhone: item.provider_phone ?? '',
    note: item.note ?? '',
    usageEnabled: item.usage_unit !== null,
    usageUnit: item.usage_unit ?? 'กม.',
    usageInterval: text(item.usage_interval),
    usageLastDone: text(item.usage_last_done),
    usageCurrent: text(item.usage_current),
  }
}

export function ItemForm({ item, onSubmit, onCancel }: ItemFormProps) {
  const [input, setInput] = useState<ItemFormInput>(() => initialInput(item))
  const [remindTouched, setRemindTouched] = useState(item !== undefined)
  const today = todayISO()
  const [daysAhead, setDaysAhead] = useState(() => {
    const days = daysAheadOf(today, item?.due_date ?? '')
    return days === null ? '' : String(days)
  })
  const [daysAheadError, setDaysAheadError] = useState<string>()
  const [errors, setErrors] = useState<ItemFieldErrors>({})
  const [formError, setFormError] = useState<string>()
  const [saving, setSaving] = useState(false)

  const fields = categoryFields(input.category)
  const patch = (changes: Partial<ItemFormInput>) => setInput((prev) => ({ ...prev, ...changes }))

  // พิมพ์ "อีกกี่วัน" -> เติมวันครบกำหนดให้
  const changeDaysAhead = (raw: string) => {
    setDaysAhead(raw)
    if (raw.trim() === '') {
      setDaysAheadError(undefined)
      return
    }
    const due = dueDateFromDaysAhead(today, raw, DAYS_AHEAD_MAX)
    if (due === null) {
      setDaysAheadError(`กรอกจำนวนวันเป็นจำนวนเต็ม 0–${DAYS_AHEAD_MAX.toLocaleString('th-TH')}`)
      return
    }
    setDaysAheadError(undefined)
    patch({ dueDate: due })
  }

  // เลือกวันจากปฏิทินเอง -> เติมช่อง "อีกกี่วัน" ให้ตรงกัน (วันที่ผ่านมาแล้ว = เว้นว่าง)
  const changeDueDate = (dueDate: string) => {
    patch({ dueDate })
    setDaysAheadError(undefined)
    const days = daysAheadOf(today, dueDate)
    setDaysAhead(days === null ? '' : String(days))
  }

  const changeCategory = (category: ReminderCategory) => {
    // ยังไม่เคยแก้ระดับเตือนเอง = เปลี่ยนตามชุดสำเร็จรูปของหมวดใหม่
    patch(remindTouched ? { category } : { category, remindBeforeDays: REMIND_PRESETS[category] })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    // ช่องที่หมวดนี้ไม่ใช้ไม่ถูกตรวจและไม่ถูกบันทึก
    const effective: ItemFormInput = {
      ...input,
      usageEnabled: input.usageEnabled && fields.usage,
      providerName: fields.provider ? input.providerName : '',
      providerPhone: fields.provider ? input.providerPhone : '',
    }
    const { errors: found, values } = validateItem(effective)
    setErrors(found)
    if (values === null) return

    setSaving(true)
    setFormError(undefined)
    const error = await onSubmit(values)
    setSaving(false)

    if (error === null) onCancel()
    else setFormError(error)
  }

  const costLabel = input.category === 'subscription' ? 'ราคา (บาท)' : 'ค่าใช้จ่ายโดยประมาณ (บาท)'

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <Select label="หมวดหมู่" value={input.category} onChange={(e) => changeCategory(e.target.value as ReminderCategory)}>
        {CATEGORIES.map((c) => (
          <option key={c.id} value={c.id}>
            {c.label}
            {c.examples ? ` (${c.examples})` : ''}
          </option>
        ))}
      </Select>
      <Input
        label="ชื่อรายการ"
        value={input.name}
        error={errors.name}
        hint={`${input.name.length}/${NAME_MAX_LENGTH}`}
        maxLength={NAME_MAX_LENGTH}
        autoFocus
        onChange={(e) => patch({ name: e.target.value })}
      />
      <div className="flex flex-col gap-1">
        <div className="grid grid-cols-2 gap-3">
          <Input label="วันครบกำหนด" type="date" value={input.dueDate} error={errors.dueDate} onChange={(e) => changeDueDate(e.target.value)} />
          <Input
            label={'หรือพิมพ์ “อีกกี่วัน”'}
            inputMode="numeric"
            placeholder="เช่น 90"
            value={daysAhead}
            error={daysAheadError}
            onChange={(e) => changeDaysAhead(e.target.value)}
          />
        </div>
        {input.dueDate !== '' && <p className="text-xs text-gray-600">ตรงกับวันที่ {formatDateLong(input.dueDate)}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="ทำซ้ำทุก (เว้นว่าง = ครั้งเดียว)"
          inputMode="numeric"
          placeholder="เช่น 6"
          value={input.repeatEvery}
          error={errors.repeatEvery}
          onChange={(e) => patch({ repeatEvery: e.target.value })}
        />
        <Select label="หน่วยรอบ" value={input.repeatUnit} onChange={(e) => patch({ repeatUnit: e.target.value as RepeatUnit })}>
          {(Object.keys(REPEAT_UNIT_LABELS) as RepeatUnit[]).map((unit) => (
            <option key={unit} value={unit}>
              {REPEAT_UNIT_LABELS[unit]}
            </option>
          ))}
        </Select>
      </div>

      <RemindDaysField
        category={input.category}
        value={input.remindBeforeDays}
        dueDate={input.dueDate}
        error={errors.remindBeforeDays}
        onChange={(days) => {
          setRemindTouched(true)
          patch({ remindBeforeDays: days })
        }}
      />

      <Input
        label={costLabel}
        inputMode="decimal"
        placeholder="ไม่ระบุก็ได้"
        value={input.cost}
        error={errors.cost}
        onChange={(e) => patch({ cost: e.target.value })}
      />

      {fields.provider && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label={input.category === 'medical' ? 'โรงพยาบาล/แพทย์' : 'ช่าง/ผู้ให้บริการ'}
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
      )}

      {fields.usage && (
        <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input type="checkbox" checked={input.usageEnabled} onChange={(e) => patch({ usageEnabled: e.target.checked })} />
            ครบกำหนดตามระยะทาง/การใช้งานด้วย (เช่น ทุก 10,000 กม.)
          </label>
          {input.usageEnabled && (
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="หน่วย"
                value={input.usageUnit}
                error={errors.usageUnit}
                maxLength={USAGE_UNIT_MAX_LENGTH}
                onChange={(e) => patch({ usageUnit: e.target.value })}
              />
              <Input
                label="ครบรอบทุก"
                inputMode="decimal"
                value={input.usageInterval}
                error={errors.usageInterval}
                onChange={(e) => patch({ usageInterval: e.target.value })}
              />
              <Input
                label="ค่าที่ทำครั้งล่าสุด"
                inputMode="decimal"
                value={input.usageLastDone}
                error={errors.usageLastDone}
                onChange={(e) => patch({ usageLastDone: e.target.value })}
              />
              <Input
                label="ค่าปัจจุบัน (อัปเดตเองเป็นระยะ)"
                inputMode="decimal"
                value={input.usageCurrent}
                error={errors.usageCurrent}
                onChange={(e) => patch({ usageCurrent: e.target.value })}
              />
            </div>
          )}
        </div>
      )}

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
