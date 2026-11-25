import type { ReactNode } from 'react'
import { DISCLAIMER, GOOD_POSITIONS, POSITION_LABELS } from '../constants'
import type { AvoidSource, LuckyColorResult as Result } from '../types/luckyColor'
import { birthLabel, todayLabel } from '../utils/taksa'
import { LuckyColorChip } from './LuckyColorChip'

const SOURCE_LABELS: Record<AvoidSource, string> = {
  birth: 'วันเกิด',
  today: 'วันนี้',
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <h2 className="text-sm font-medium text-gray-900">{title}</h2>
      {children}
    </section>
  )
}

const EMPTY_CLASS = 'text-sm text-gray-500'

/** ผลลัพธ์ 3 ส่วน: สีปังคูณสอง · สีเสริมตามเรื่อง · สีต้องห้ามวันนี้ */
export function LuckyColorResult({ result }: { result: Result }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-base text-gray-900">
        สวัสดี{todayLabel(result.today)}! นี่คือสีที่ใช่สำหรับคนเกิด
        {birthLabel(result.birthDay)}โดยเฉพาะ
      </p>

      <Section title="🌟 สีปังคูณสอง (ใส่แล้วดีรอบด้าน)">
        {result.superLucky.length === 0 ? (
          <p className={EMPTY_CLASS}>-</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {result.superLucky.map(({ day, birthPosition, todayPosition }) => (
              <li key={day} className="flex flex-col items-start gap-1">
                <LuckyColorChip day={day} />
                <span className="text-xs text-gray-500">
                  หนุน{POSITION_LABELS[birthPosition]}ตามวันเกิด และ
                  {POSITION_LABELS[todayPosition]}วันนี้
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="💼 สีเสริมตามเรื่องที่ต้องการ">
        <dl className="flex flex-col gap-3">
          {GOOD_POSITIONS.map((position) => (
            <div key={position} className="flex flex-col gap-1">
              <dt className="text-xs text-gray-600">{POSITION_LABELS[position]}</dt>
              <dd className="flex flex-wrap gap-2">
                {result.boost[position].length === 0 ? (
                  <span className={EMPTY_CLASS}>วันนี้ไม่มีสีเด่นในหมวดนี้</span>
                ) : (
                  result.boost[position].map((day) => <LuckyColorChip key={day} day={day} />)
                )}
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section title="🚫 สีต้องห้ามวันนี้ (เลี่ยงได้เลี่ยง)">
        <ul className="flex flex-col gap-2">
          {result.avoid.map(({ day, sources }) => (
            <li key={day} className="flex flex-wrap items-center gap-2">
              <LuckyColorChip day={day} />
              <span className="text-xs text-gray-500">กาลกิณี{sources.map((s) => SOURCE_LABELS[s]).join('และ')}</span>
            </li>
          ))}
        </ul>
      </Section>

      <p className="text-xs text-gray-500">{DISCLAIMER}</p>
    </div>
  )
}
