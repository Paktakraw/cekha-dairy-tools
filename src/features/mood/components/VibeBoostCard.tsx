import { useState } from 'react'
import { HeartHandshake, Phone, Shuffle, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { IconButton } from '../../../shared/components/ui'
import { HOTLINE_NUMBER, RANDOMIZER_PATH, type LowMoodScore } from '../constants'
import { BOOST_MESSAGES, BOOST_SUGGESTIONS, pickMessage } from '../utils/messages'

interface VibeBoostCardProps {
  level: LowMoodScore
  /** ติดดิ่งต่อเนื่องหลายวัน: แสดงข้อความดูแลใจเพิ่ม + สายด่วน */
  showCare: boolean
}

/** การ์ดปลอบใจเมื่อเลือก 😩 / 😭 (ปิดได้) */
export function VibeBoostCard({ level, showCare }: VibeBoostCardProps) {
  // สุ่มครั้งเดียวต่อการแสดงการ์ด ไม่ให้ข้อความเปลี่ยนทุกครั้งที่หน้าวาดใหม่
  const [seed] = useState(() => Math.floor(Math.random() * 1000))
  const [closed, setClosed] = useState(false)
  if (closed) return null

  return (
    <section aria-label="กำลังใจสำหรับวันนี้" className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="flex items-start gap-2 text-sm text-gray-800">
          <HeartHandshake className="mt-0.5 h-4 w-4 shrink-0 text-gray-600" />
          {pickMessage(BOOST_MESSAGES[level], seed)}
        </p>
        <IconButton icon={X} label="ปิดการ์ด" size="sm" onClick={() => setClosed(true)} />
      </div>
      <p className="text-sm text-gray-600">ลองทำเบา ๆ ดู: {pickMessage(BOOST_SUGGESTIONS, seed + level)}</p>
      <Link
        to={RANDOMIZER_PATH}
        className="inline-flex w-fit items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-100"
      >
        <Shuffle className="h-4 w-4" />
        สุ่มเมนูฮีลใจ
      </Link>
      {showCare && (
        <div className="rounded-md border border-gray-200 bg-white p-3 text-sm text-gray-700">
          <p>ช่วงนี้ดิ่งมาหลายวันติดกันแล้ว ลองเล่าให้คนที่ไว้ใจฟัง หรือคุยกับผู้เชี่ยวชาญดูนะ</p>
          <p className="mt-1 flex items-center gap-2">
            <Phone className="h-4 w-4 shrink-0" />
            สายด่วนสุขภาพจิต กรมสุขภาพจิต โทร{' '}
            <a href={`tel:${HOTLINE_NUMBER}`} className="font-medium underline">
              {HOTLINE_NUMBER}
            </a>{' '}
            (ฟรี 24 ชม.)
          </p>
          <p className="mt-1 text-xs text-gray-500">แอปนี้ไม่ใช่เครื่องมือวินิจฉัยหรือแทนการรักษาทางการแพทย์</p>
        </div>
      )}
    </section>
  )
}
