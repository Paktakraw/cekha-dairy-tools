import type { Urgency } from '../types/reminder'

const STYLES: Record<Urgency, string> = {
  red: 'border-red-300 bg-red-50 text-red-800',
  yellow: 'border-amber-300 bg-amber-50 text-amber-800',
  green: 'border-emerald-300 bg-emerald-50 text-emerald-800',
}

/** ป้ายสถานะเร่งด่วน: มีข้อความกำกับเสมอ ไม่พึ่งสีอย่างเดียว */
export function UrgencyBadge({ urgency, label }: { urgency: Urgency; label: string }) {
  return <span className={`inline-block rounded border px-2 py-0.5 text-xs font-medium ${STYLES[urgency]}`}>{label}</span>
}
