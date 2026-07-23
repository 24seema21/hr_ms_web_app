import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

interface ContainerProps {
  children: ReactNode
  className?: string
}

/**
 * Centres content and caps its width, with the horizontal padding that keeps
 * text off the screen edge on a phone.
 *
 * Every landing-page section uses this, which is what makes the left edges of
 * the header, hero and footer line up perfectly without anyone measuring.
 */
export function Container({ children, className }: ContainerProps) {
  return (
    <div className={cn('mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8', className)}>
      {children}
    </div>
  )
}
