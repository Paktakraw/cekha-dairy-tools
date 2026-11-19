import { MIN_DAYS_FOR_SUMMARY, MOODS, TAGS, TOP_TAGS_COUNT, moodMeta, tagLabel } from '../constants'
import type { MoodEntry } from '../types/mood'
import { parseMonthKey } from '../utils/calendar'
import { ENCOURAGEMENTS, pickMessage } from '../utils/messages'
import { dominantMood, moodShares, topTags } from '../utils/stats'

/** การ์ดสรุปรายเดือน: สัดส่วนอารมณ์ อารมณ์เด่น แท็กยอดนิยม และข้อความให้กำลังใจ */
export function MonthSummaryCard({ month, entries }: { month: string; entries: MoodEntry[] }) {
  const shares = moodShares(entries)
  const dominant = dominantMood(shares)
  const tags = topTags(entries, TOP_TAGS_COUNT, TAGS.map((t) => t.id))
  const { year, month: m } = parseMonthKey(month)

  return (
    <section aria-label="สรุปรายเดือน" className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
      {dominant !== null && (
        <div className="flex items-center gap-3">
          <span className="text-5xl leading-none" aria-hidden="true">
            {moodMeta(dominant).emoji}
          </span>
          <div className="min-w-0">
            <p className="text-xs text-gray-500">อารมณ์เด่นของเดือน</p>
            <p className="text-base font-medium break-words text-gray-900">{moodMeta(dominant).label}</p>
            <p className="text-xs text-gray-500">เช็กอิน {entries.length.toLocaleString('th-TH')} วัน</p>
          </div>
        </div>
      )}

      {/* แถบสัดส่วน (ข้อมูลจริงอ่านได้จากตารางด้านล่างด้วย ไม่พึ่งสีอย่างเดียว) */}
      <div className="flex h-4 overflow-hidden rounded-full border border-gray-200 bg-white" role="img" aria-label="แถบสัดส่วนอารมณ์">
        {shares
          .filter((s) => s.percent > 0)
          .map((s) => (
            <div key={s.score} className={moodMeta(s.score).bgClass} style={{ width: `${s.percent}%` }} />
          ))}
      </div>
      <ul className="flex flex-col gap-1.5">
        {MOODS.map((mood) => {
          const share = shares.find((s) => s.score === mood.score)
          return (
            <li key={mood.score} className="flex items-center gap-2 text-sm text-gray-700">
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${mood.bgClass}`} aria-hidden="true">
                {mood.emoji}
              </span>
              <span className="min-w-0 flex-1 truncate">{mood.label}</span>
              <span className="tabular-nums text-gray-500">{(share?.count ?? 0).toLocaleString('th-TH')} วัน</span>
              <span className="w-10 text-right font-medium tabular-nums text-gray-900">{share?.percent ?? 0}%</span>
            </li>
          )
        })}
      </ul>

      {tags.length > 0 && (
        <div>
          <p className="text-xs text-gray-500">เรื่องที่เจอบ่อย</p>
          <div className="mt-1 flex flex-wrap gap-2">
            {tags.map(({ tag, count }) => (
              <span key={tag} className="rounded-full border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700">
                {tagLabel(tag)} · {count.toLocaleString('th-TH')}
              </span>
            ))}
          </div>
        </div>
      )}

      {dominant !== null && <p className="text-sm text-gray-800">{pickMessage(ENCOURAGEMENTS[dominant], year * 12 + m)}</p>}
      {entries.length < MIN_DAYS_FOR_SUMMARY && (
        <p className="text-xs text-gray-500">เดือนนี้เช็กอินยังไม่ถึง {MIN_DAYS_FOR_SUMMARY} วัน ตัวเลขอาจยังไม่สะท้อนภาพรวมจริง</p>
      )}
    </section>
  )
}
