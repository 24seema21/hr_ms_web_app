import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

const toneClasses = {
  neutral: 'text-ink-500 hover:bg-ink-100 hover:text-ink-900',
  brand: 'text-brand-700 hover:bg-brand-50 hover:text-brand-800',
  danger: 'text-danger-600 hover:bg-danger-50 hover:text-danger-700',
} as const

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-9 w-9',
} as const

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /**
   * The accessible name. Required, not optional.
   *
   * An icon-only button with no label is announced as "button" and nothing
   * else, which makes a screen reader user guess. Typing this as a required
   * prop means the compiler asks the question that a code review would miss.
   */
  label: string
  /** The glyph. Sized by the caller; `aria-hidden` is applied here. */
  icon: ReactNode
  tone?: keyof typeof toneClasses
  size?: keyof typeof sizeClasses
}

/** A square, icon-only control for dense chrome: table rows, toolbars, dialogs. */
export function IconButton({
  label,
  icon,
  tone = 'neutral',
  size = 'md',
  className,
  type = 'button',
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      // Both the accessible name and the hover tooltip. Same words either way,
      // so nobody has to maintain two descriptions of one button.
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-control',
        'transition-colors duration-150',
        'disabled:cursor-not-allowed disabled:opacity-55',
        toneClasses[tone],
        sizeClasses[size],
        className,
      )}
      {...rest}
    >
      <span aria-hidden="true" className="flex items-center justify-center">
        {icon}
      </span>
    </button>
  )
}
