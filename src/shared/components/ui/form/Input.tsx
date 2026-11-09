import { useId, type InputHTMLAttributes } from 'react'
import { controlClass, FieldShell, type BaseFieldProps, type HintProps } from './FieldShell'

export function Input({
  label,
  error,
  hint,
  className = '',
  ...props
}: BaseFieldProps & HintProps & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId()
  return (
    <FieldShell label={label} error={error} hint={hint} id={id}>
      <input id={id} aria-invalid={!!error} className={`${controlClass} ${className}`} {...props} />
    </FieldShell>
  )
}
