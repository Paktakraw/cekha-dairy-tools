import { useId, type TextareaHTMLAttributes } from 'react'
import { controlClass, FieldShell, type BaseFieldProps, type HintProps } from './FieldShell'

export function Textarea({
  label,
  error,
  hint,
  className = '',
  ...props
}: BaseFieldProps & HintProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId()
  return (
    <FieldShell label={label} error={error} hint={hint} id={id}>
      <textarea id={id} rows={3} aria-invalid={!!error} className={`${controlClass} ${className}`} {...props} />
    </FieldShell>
  )
}
