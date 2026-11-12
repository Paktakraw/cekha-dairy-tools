import { Plus, Scale } from 'lucide-react'
import { PageHeader } from '../../../shared/components/layout/PageHeader'
import { Button } from '../../../shared/components/ui'
import { OptionCard } from '../components/OptionCard'
import { ResultSummary } from '../components/ResultSummary'
import { useComparison } from '../hooks/useComparison'

export default function UnitPricePage() {
  const { options, validations, result, resultUnitIds, canAdd, canRemove, updateOption, addOption, removeOption, compare, setResultUnit } =
    useComparison()

  return (
    <>
      <PageHeader>
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-xl font-semibold text-gray-900">เทียบราคาต่อหน่วย</h1>
          <Button onClick={addOption} disabled={!canAdd} title={canAdd ? undefined : 'เพิ่มได้สูงสุด 3 ตัวเลือก'}>
            <Plus className="h-4 w-4" />
            เพิ่มตัวเลือก
          </Button>
        </div>
      </PageHeader>
      <div className="mx-auto mt-4 flex max-w-2xl flex-col gap-4">
        <p className="text-sm text-gray-600">
          กรอกราคาและปริมาณของสินค้าที่อยากเทียบ แล้วกด “เปรียบเทียบ” เพื่อดูว่าตัวไหนคุ้มที่สุดต่อกรัม มิลลิลิตร หรือชิ้น (ข้อมูลไม่ถูกบันทึก)
        </p>
        <div className={`grid gap-2 sm:gap-4 ${options.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
          {options.map((option, index) => (
            <OptionCard
              key={option.id}
              option={option}
              index={index}
              validation={validations[option.id]}
              canRemove={canRemove}
              onChange={(patch) => updateOption(option.id, patch)}
              onRemove={() => removeOption(option.id)}
            />
          ))}
        </div>
        <Button onClick={compare} className="w-full sm:w-auto sm:self-end">
          <Scale className="h-4 w-4" />
          เปรียบเทียบ
        </Button>
        <ResultSummary result={result} options={options} resultUnitIds={resultUnitIds} onResultUnitChange={setResultUnit} />
      </div>
    </>
  )
}
