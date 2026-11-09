import { RotateCcw, Shuffle } from 'lucide-react'
import { Button } from '../../../shared/components/ui'
import type { RandomItem } from '../types/random'

interface RandomPickerProps {
  lastPicked: RandomItem | null
  lastPickedGroupName: string | null
  /** จำนวนรายการทั้งหมดในกองที่เลือก */
  poolCount: number
  /** จำนวนรายการที่ยังสุ่มได้ */
  currentCount: number
  hasSelection: boolean
  /** กำลังเล่น animation สุ่ม */
  spinning: boolean
  /** ข้อความที่สลับแสดงระหว่าง animation */
  previewLabel: string | null
  onPick: () => void
  onReset: () => void
}

function statusMessage(hasSelection: boolean, poolCount: number, currentCount: number): string {
  if (!hasSelection) return 'เลือกอย่างน้อย 1 กลุ่มก่อนสุ่ม'
  if (poolCount === 0) return 'กลุ่มที่เลือกยังไม่มีรายการ ไปเพิ่มรายการที่แท็บ “จัดการกลุ่ม”'
  if (currentCount === 0) return 'สุ่มครบทุกรายการแล้ว กด Reset Session เพื่อเริ่มสุ่มใหม่'
  return `เหลือ ${currentCount} จาก ${poolCount} รายการที่ยังสุ่มได้`
}

export function RandomPicker({
  lastPicked,
  lastPickedGroupName,
  poolCount,
  currentCount,
  hasSelection,
  spinning,
  previewLabel,
  onPick,
  onReset,
}: RandomPickerProps) {
  return (
    <section className="flex flex-col items-center gap-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-8 text-center">
      <div className="min-h-20" aria-live="polite" aria-busy={spinning}>
        {spinning ? (
          <>
            <p className="text-sm text-gray-500">กำลังสุ่ม...</p>
            <p className="mt-1 text-3xl font-semibold break-words text-gray-400">{previewLabel}</p>
          </>
        ) : lastPicked ? (
          <>
            <p className="text-sm text-gray-500">ผลการสุ่มล่าสุด</p>
            <p className="mt-1 text-3xl font-semibold break-words text-gray-900">{lastPicked.label}</p>
            {lastPickedGroupName && <p className="mt-1 text-sm text-gray-500">จากกลุ่ม {lastPickedGroupName}</p>}
          </>
        ) : (
          <p className="pt-6 text-sm text-gray-500">ผลการสุ่มจะแสดงที่นี่</p>
        )}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Button onClick={onPick} disabled={currentCount === 0 || spinning}>
          <Shuffle className={`h-4 w-4 ${spinning ? 'animate-spin' : ''}`} />
          สุ่ม
        </Button>
        <Button variant="secondary" onClick={onReset} disabled={spinning}>
          <RotateCcw className="h-4 w-4" />
          Reset Session
        </Button>
      </div>
      <p className="text-sm text-gray-500">{statusMessage(hasSelection, poolCount, currentCount)}</p>
    </section>
  )
}
