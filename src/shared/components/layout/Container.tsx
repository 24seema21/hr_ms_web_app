import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

const widthClasses = {
  /** Marketing pages: capped so headlines and paragraphs stay readable. */
  default: 'max-w-6xl',
  /** The signed-in workspace: tables want every pixel they can get. */
  wide: 'max-w-[92rem]',
} as const

interface ContainerProps {
  children: ReactNode
  width?: keyof typeof widthClasses
  className?: string
}

/**
 * Centres content and caps its width, with the horizontal padding that keeps
 * text off the screen edge on a phone.
 *
 * Every landing-page section uses this, which is what makes the left edges of
 * the header, hero and footer line up perfectly without anyone measuring.
 */
export function Container({
  children,
  width = 'default',
  className,
}: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-4 sm:px-6 lg:px-8',
        widthClasses[width],
        className,
      )}
    >
      {children}
    </div>
  )
}
