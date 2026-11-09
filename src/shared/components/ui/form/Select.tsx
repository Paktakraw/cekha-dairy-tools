import { useId, type SelectHTMLAttributes } from 'react'
import { controlClass, FieldShell, type BaseFieldProps } from './FieldShell'

export function Select({ label, error, className = '', children, ...props }: BaseFieldProps & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId()
  return (
    <FieldShell label={label} error={error} id={id}>
      <select id={id} aria-invalid={!!error} className={`${controlClass} ${className}`} {...props}>
        {children}
      </select>
    </FieldShell>
  )
}
