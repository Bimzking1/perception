import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-white shadow-[0_1px_0_rgba(255,255,255,0.18)_inset] hover:bg-accent-strong active:translate-y-px',
  secondary:
    'border border-border bg-elevated text-fg hover:border-accent/60 hover:bg-elevated/80',
  ghost: 'text-muted hover:bg-elevated hover:text-fg',
  outline: 'border border-border bg-transparent text-fg hover:border-accent/60 hover:bg-accent-soft',
  danger: 'bg-danger-soft text-danger hover:bg-danger hover:text-white',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 gap-1.5 rounded-lg px-3 text-xs',
  md: 'h-10 gap-2 rounded-xl px-4 text-sm',
  lg: 'h-12 gap-2 rounded-xl px-6 text-sm',
}

export function buttonClasses(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  className?: string,
): string {
  return cn(
    'inline-flex select-none items-center justify-center font-semibold tracking-tight transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-45',
    variantClasses[variant],
    sizeClasses[size],
    className,
  )
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

export function Button({ variant = 'primary', size = 'md', className, type, ...props }: ButtonProps) {
  return (
    <button
      type={type ?? 'button'}
      className={buttonClasses(variant, size, className)}
      {...props}
    />
  )
}
