import { useState } from 'react'
import { Button, Select } from '../../../shared/components/ui'
import { ConversionTable } from '../components/ConversionTable'
import { MeasureFields } from '../components/MeasureFields'
import { MANUAL_VALUE, ProfileSelect } from '../components/ProfileSelect'
import { CATEGORIES, DEMOGRAPHIC_LABELS } from '../constants'
import { useSizeContext } from '../hooks/useSizeContext'
import type { ConverterCategory, Demographic, MeasureInput, MeasureKey, Measurements, UnitPref } from '../types/size'
import { convert } from '../utils/converter'
import { EMPTY_MEASURE_INPUT, EMPTY_MEASUREMENTS, parseMeasures } from '../utils/validation'

export default function ConverterPage() {
  const { profiles, selected, selectProfile } = useSizeContext()
  const [category, setCategory] = useState<ConverterCategory>('shoes')
  const [manual, setManual] = useState(false)
  const [manualDemographic, setManualDemographic] = useState<Demographic>('men')
  const [manualUnit, setManualUnit] = useState<UnitPref>('cm')
  const [manualInput, setManualInput] = useState<MeasureInput>({ ...EMPTY_MEASURE_INPUT })
  const [wideFoot, setWideFoot] = useState(false)
  const [oversize, setOversize] = useState(false)

  const useManual = manual || selected === null
  const def = CATEGORIES.find((c) => c.id === category) ?? CATEGORIES[0]
  const needs: MeasureKey[] = def?.needs ?? []

  // โหมดกรอกเอง: ตรวจเฉพาะช่องของหมวดนี้ (ช่องอื่นที่ผิดไม่ขวางหมวดนี้)
  const relevantInput = { ...EMPTY_MEASURE_INPUT }
  for (const key of needs) relevantInput[key] = manualInput[key]
  const parsed = parseMeasures(relevantInput, manualUnit)
  const manualMeasures: Measurements = parsed.values ?? EMPTY_MEASUREMENTS

  const measurements: Partial<Measurements> = useManual ? manualMeasures : (selected ?? EMPTY_MEASUREMENTS)
  const demographic = useManual ? manualDemographic : (selected?.demographic ?? 'men')
  const hasErrors = useManual && parsed.values === null

  const result = convert(category, measurements, { demographic, wideFoot, oversize })
  const showFit = category === 'shoes' || category === 'tops' || category === 'bottoms'

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4">
        {profiles.length > 0 ? (
          <ProfileSelect
            profiles={profiles}
            value={useManual ? MANUAL_VALUE : (selected?.id ?? '')}
            allowManual
            onChange={(value) => {
              if (value === MANUAL_VALUE) setManual(true)
              else {
                setManual(false)
                selectProfile(value)
              }
            }}
          />
        ) : (
          <p className="text-sm text-gray-600">ยังไม่มีโปรไฟล์ ลองกรอกค่าด้านล่างได้เลย หรือไปที่แท็บ “โปรไฟล์” เพื่อบันทึกสัดส่วนไว้ใช้ซ้ำ</p>
        )}

        {useManual && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Select label="ตารางไซส์ที่ใช้" value={manualDemographic} onChange={(e) => setManualDemographic(e.target.value as Demographic)}>
                {(Object.keys(DEMOGRAPHIC_LABELS) as Demographic[]).map((d) => (
                  <option key={d} value={d}>
                    {DEMOGRAPHIC_LABELS[d]}
                  </option>
                ))}
              </Select>
              <Select label="หน่วยที่กรอก" value={manualUnit} onChange={(e) => setManualUnit(e.target.value as UnitPref)}>
                <option value="cm">เซนติเมตร (cm)</option>
                <option value="inch">นิ้ว (inch)</option>
              </Select>
            </div>
            <MeasureFields
              keys={needs}
              unit={manualUnit}
              values={manualInput}
              errors={parsed.errors}
              onChange={(key, value) => setManualInput((prev) => ({ ...prev, [key]: value }))}
            />
          </>
        )}
      </section>

      <div className="flex flex-wrap gap-2" role="group" aria-label="หมวดสินค้า">
        {CATEGORIES.map((c) => (
          <Button key={c.id} variant={category === c.id ? 'primary' : 'secondary'} size="sm" aria-pressed={category === c.id} onClick={() => setCategory(c.id)}>
            {c.label}
          </Button>
        ))}
      </div>

      {showFit && (
        <section className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          {category === 'shoes' ? (
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={wideFoot} onChange={(e) => setWideFoot(e.target.checked)} />
              หน้าเท้ากว้าง (เผื่อความยาวเพิ่มราวครึ่งไซส์)
            </label>
          ) : (
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={oversize} onChange={(e) => setOversize(e.target.checked)} />
              ชอบใส่หลวม / Oversize (ขยับขึ้น 1 ไซส์)
            </label>
          )}
        </section>
      )}

      {hasErrors ? (
        <p className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">แก้ค่าที่กรอกให้ถูกต้องก่อน จึงจะแสดงผล</p>
      ) : (
        <ConversionTable result={result} showRecommended={showFit && (wideFoot || oversize)} />
      )}
    </div>
  )
}
