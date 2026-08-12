import { cn } from '@/shared/lib/cn'

interface SkeletonProps {
  className?: string
}

/**
 * A placeholder shaped like the content that is coming.
 *
 * Why this rather than a spinner: a spinner says "something is happening"
 * and nothing else, so the page still arrives as a surprise. A skeleton in the
 * shape of the table means the layout is already settled when the data lands —
 * nothing jumps, and the wait feels shorter because the eye has somewhere to
 * rest.
 *
 * Always `aria-hidden`: the shapes are meaningless to a screen reader, which
 * should hear one "Loading employees" from the surrounding live region instead
 * of twenty announcements of nothing.
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-control bg-ink-200/70', className)}
    />
  )
}
