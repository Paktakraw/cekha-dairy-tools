import type { ReactNode } from 'react'

/** class กลางของ Input / Select / Textarea */
export const controlClass =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none disabled:bg-gray-100'

export interface BaseFieldProps {
  label: string
  error?: string
}

/** ข้อความเล็กด้านล่างขวา เช่น ตัวนับตัวอักษร "12/100" */
export interface HintProps {
  hint?: string
}

interface FieldShellProps extends BaseFieldProps, HintProps {
  id: string
  children: ReactNode
}

export function FieldShell({ label, error, hint, id, children }: FieldShellProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
      {(error || hint) && (
        <div className="flex justify-between gap-2 text-xs">
          <p className="text-red-700">{error}</p>
          {hint && <p className="ml-auto text-gray-400">{hint}</p>}
        </div>
      )}
    </div>
  )
}
