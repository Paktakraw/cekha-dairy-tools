import { PageHeader } from '../../../shared/components/layout/PageHeader'
import { ErrorState, Spinner } from '../../../shared/components/ui'
import { BirthDayPicker } from '../components/BirthDayPicker'
import { LuckyColorResult } from '../components/LuckyColorResult'
import { useBirthDay } from '../hooks/useBirthDay'
import { useTaksaNow } from '../hooks/useTaksaNow'
import { computeLuckyColors } from '../utils/taksa'

export default function LuckyColorPage() {
  const { selected, loading, error, reload, choose } = useBirthDay()
  const now = useTaksaNow()

  let body
  if (loading) body = <Spinner />
  else if (error) body = <ErrorState title="โหลดวันเกิดไม่สำเร็จ" description={error} onRetry={reload} />
  else if (selected === null) {
    body = (
      <>
        <p className="text-sm text-gray-600">เลือกวันเกิดของคุณ แล้วระบบจะบอกสีที่ใช่ของวันนี้ทันที (เปลี่ยนวันเกิดได้ตลอดเวลา)</p>
        <BirthDayPicker value={null} onChange={choose} showHelp />
      </>
    )
  } else {
    body = (
      <>
        <BirthDayPicker value={selected} onChange={choose} />
        <LuckyColorResult result={computeLuckyColors(selected, now)} />
      </>
    )
  }

  return (
    <>
      <PageHeader>
        <h1 className="text-xl font-semibold text-gray-900">สีที่ใช่</h1>
      </PageHeader>
      <div className="mx-auto mt-4 flex max-w-2xl flex-col gap-4">{body}</div>
    </>
  )
}
