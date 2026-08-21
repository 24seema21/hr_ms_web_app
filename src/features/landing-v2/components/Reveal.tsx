import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

interface RevealProps {
  children: ReactNode
  /**
   * Milliseconds to hold before this element starts.
   *
   * Used to stagger siblings — a row of cards arriving 60ms apart reads as one
   * considered movement, where the same cards arriving together read as a
   * single flash and nothing at all.
   */
  delay?: number
  className?: string
}

/**
 * Fades and lifts its children in the first time they scroll into view.
 *
 * ── Why this is here at all ──────────────────────────────────────────────────
 * A long page of equally-weighted bands gives the reader no sense of moving
 * through an argument. Content that assembles as it arrives marks each section
 * as a place you got to, which is the "understand the flow" half of the brief
 * doing its work in motion rather than in copy.
 *
 * ── The rules it follows ─────────────────────────────────────────────────────
 * Once, never again: the observer disconnects on the first intersection, so
 * scrolling back up does not re-animate a section the reader has already read.
 * Re-triggering is the single most common way this effect becomes annoying.
 *
 * Reduced motion is handled globally rather than here — the block in index.css
 * collapses every transition to 0.01ms, so somebody who has asked their OS for
 * less movement gets the content immediately, still visible, with no travel.
 *
 * And if there is no observer at all (jsdom, or a browser old enough to lack
 * it) the content shows straight away. A progressive enhancement that hides
 * content when it fails is not an enhancement.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  /*
    The "no observer" case is answered in the initialiser rather than in the
    effect. Setting it from inside the effect would work, but it is a state
    update in an effect body — a cascading second render on every instance, and
    a lint error for exactly that reason. Asked here, it is just the starting
    value: visible when there is nothing that could ever reveal it.
  */
  const [shown, setShown] = useState(
    () => typeof IntersectionObserver === 'undefined',
  )

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          setShown(true)
          observer.disconnect()
        }
      },
      /*
        A small bottom inset, so an element starts moving once it is properly
        on screen rather than the instant its first pixel clears the fold —
        which on a fast scroll means the animation is over before it is seen.
      */
      { rootMargin: '0px 0px -12% 0px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        'transition-[opacity,translate] duration-700 ease-out-quart',
        shown ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
        className,
      )}
    >
      {children}
    </div>
  )
}
