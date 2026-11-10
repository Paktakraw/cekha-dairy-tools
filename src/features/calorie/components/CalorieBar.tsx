interface CalorieBarProps {
  total: number
  /** แคลอรี่เป้าหมาย (null = ยังไม่มีเป้าหมาย ไม่แสดงแถบ) */
  target: number | null
  label: string
}

/** แถบเทียบแคลอรี่กับเป้าหมาย เกินเป้าหมายแสดงเป็นสีแดงโทนหม่น */
export function CalorieBar({ total, target, label }: CalorieBarProps) {
  if (target === null || target <= 0) return null
  const percent = Math.min(100, Math.round((total / target) * 100))
  const over = total > target
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={target}
      aria-valuenow={Math.min(total, target)}
      className="h-2 w-full overflow-hidden rounded-full bg-gray-200"
    >
      <div className={`h-full rounded-full ${over ? 'bg-red-700' : 'bg-gray-900'}`} style={{ width: `${percent}%` }} />
    </div>
  )
}
