import { useEffect, useRef } from 'react'
import { cn } from '@/shared/lib/cn'
import { SECTION_IDS, SECTIONS } from '../data/sections'
import { useScrollSpy } from '../lib/useScrollSpy'

/*
  ─────────────────────────────────────────────────────────────────────────────
  THE FLOW RAIL
  ─────────────────────────────────────────────────────────────────────────────
  The signature element of this design, and the direct answer to "make it easy
  to understand the flow".

  A landing page is an argument made in a fixed order, but nothing about a long
  scroll tells the reader that. The rail makes the structure permanent: seven
  stops, always visible, with the current one lit. At any moment you can see
  how much argument there is, which part you are in, and how much is left —
  and you can jump to any of it without scrolling back to the header.

  It is one <nav> in the markup and two layouts in CSS, not two components:

    below xl  a sticky strip under the header, chips scrolling horizontally
    xl and up a fixed column of dots in the left margin, labels on hover

  Two components would mean the same links in the accessibility tree twice, and
  a screen-reader user tabbing through fourteen anchors to reach seven places.
*/

export function FlowRail() {
  const activeId = useScrollSpy(SECTION_IDS)

  const listRef = useRef<HTMLUListElement>(null)
  /*
    One ref object holding every chip, keyed by section id, so the effect below
    can reach the active one without a ref per section or a querySelector
    reaching outside React.
  */
  const chipRefs = useRef<Record<string, HTMLAnchorElement | null>>({})

  /*
    Keep the active chip on screen in the horizontal layout.

    Without this the small-screen rail is actively misleading: by the third
    section the lit chip has scrolled out of the strip, so the indicator shows
    nothing and the reader concludes the thing is decorative.

    `scrollWidth > clientWidth` is the test for "am I in the horizontal
    layout", asked of the element itself rather than of a media query — the
    vertical rail never overflows, so it never matches, and there is no
    breakpoint written down in two places waiting to drift.

    `block: 'nearest'` is load-bearing: without it the browser is also allowed
    to scroll the *page* vertically to bring the chip into view, which fights
    the scroll that just moved it.
  */
  useEffect(() => {
    const list = listRef.current
    const chip = chipRefs.current[activeId]
    if (!list || !chip) return
    if (list.scrollWidth <= list.clientWidth) return
    if (typeof chip.scrollIntoView !== 'function') return

    chip.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [activeId])

  return (
    <nav
      aria-label="Page sections"
      className={cn(
        // Below xl: a sticky strip directly under the 4rem header.
        'nx-glass sticky top-16 z-40 border-b border-nx-line',
        // xl and up: lifted out of the flow entirely, into the left margin.
        'xl:fixed xl:top-1/2 xl:left-5 xl:w-auto xl:-translate-y-1/2',
        'xl:rounded-full xl:border xl:border-nx-line xl:shadow-nx-soft',
      )}
    >
      <ul
        ref={listRef}
        className={cn(
          'flex items-center gap-1 overflow-x-auto px-3 py-2',
          // The strip scrolls, but a scrollbar under a 40px bar is all bar.
          '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          'xl:flex-col xl:items-stretch xl:gap-0.5 xl:overflow-visible xl:p-2',
        )}
      >
        {SECTIONS.map((section) => {
          const isActive = section.id === activeId

          return (
            <li key={section.id}>
              <a
                ref={(node) => {
                  chipRefs.current[section.id] = node
                }}
                href={`#${section.id}`}
                /*
                  `aria-current="true"` is how the *state* reaches a screen
                  reader — the colour change says it to everyone else. Only the
                  active link carries it; `undefined` removes the attribute
                  rather than setting it to "false", which some readers
                  announce.
                */
                aria-current={isActive ? 'true' : undefined}
                className={cn(
                  'group relative flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                  'xl:justify-center xl:px-2.5 xl:py-2.5',
                  isActive
                    ? 'bg-nx-jade-soft text-nx-jade-ink'
                    : 'text-nx-muted hover:bg-nx-jade-soft/60 hover:text-nx-ink',
                )}
              >
                {/*
                  The stop itself. It is the only part of a chip that survives
                  into the vertical layout, so it has to carry the state on its
                  own: filled and grown when active, hollow otherwise.
                */}
                <span
                  aria-hidden="true"
                  className={cn(
                    'h-1.5 w-1.5 shrink-0 rounded-full transition-[background-color,scale]',
                    'xl:h-2 xl:w-2',
                    isActive
                      ? 'scale-125 bg-nx-jade'
                      : 'bg-nx-line-strong group-hover:bg-nx-faint',
                  )}
                />

                {/*
                  The label: inline text in the strip, and a hover tooltip in
                  the rail. It is never removed from the DOM, because it is the
                  link's accessible name — a rail of seven anchors named
                  nothing is a rail nobody can use.

                  `pointer-events-none` on the tooltip so it cannot sit between
                  the cursor and the content it is floating over.
                */}
                <span
                  className={cn(
                    'whitespace-nowrap',
                    'xl:pointer-events-none xl:absolute xl:left-full xl:ml-2',
                    'xl:rounded-full xl:bg-nx-ink xl:px-2.5 xl:py-1 xl:text-nx-bg',
                    'xl:opacity-0 xl:shadow-nx-soft xl:transition-opacity',
                    'xl:group-hover:opacity-100 xl:group-focus-visible:opacity-100',
                  )}
                >
                  {section.label}
                </span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
