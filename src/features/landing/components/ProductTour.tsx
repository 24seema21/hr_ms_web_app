import { useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { Container } from '@/shared/components/layout/Container'
import { cn } from '@/shared/lib/cn'
import { AttendanceScreen } from './screens/AttendanceScreen'
import { LeaveScreen } from './screens/LeaveScreen'
import { SettingsScreen } from './screens/SettingsScreen'

/*
  ─────────────────────────────────────────────────────────────────────────────
  THE TOUR
  ─────────────────────────────────────────────────────────────────────────────
  Three screens from inside the product, switched by a tab bar drawn as the
  column headers of a register — the same device as the roster grid in the
  hero, one section later.

  Only one panel is mounted at a time. Rendering all three and hiding two with
  `hidden` would put three dense screens in the accessibility tree, and a
  screen-reader user would walk through two panels nobody can see.
*/

const TABS = [
  {
    id: 'attendance',
    label: 'Attendance',
    /** What the reader should notice, said before they look. */
    caption:
      'Sessions rather than a single in/out pair, so an office morning and a remote afternoon are one day. Anything the clock cannot explain becomes a regularisation with a remark, not a message to HR.',
    Screen: AttendanceScreen,
  },
  {
    id: 'settings',
    label: 'Settings',
    caption:
      'Every rule the rest of the product obeys, in one admin screen. What is reachable here is decided by the subscription — locked sections stay visible so you know what an upgrade actually buys.',
    Screen: SettingsScreen,
  },
  {
    id: 'leave',
    label: 'Leave & balances',
    caption:
      'The ledger an employee checks before applying and the queue a manager works through, reading the same entitlement rules configured in Settings.',
    Screen: LeaveScreen,
  },
] as const

export function ProductTour() {
  const [activeId, setActiveId] = useState<string>(TABS[0].id)
  /*
    One ref holding every tab button, so the arrow keys can move focus without
    a ref per tab or a `document.querySelector` reaching outside React.
  */
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const activeIndex = TABS.findIndex((tab) => tab.id === activeId)
  const { Screen, caption } = TABS[activeIndex]

  /*
    Arrow-key navigation is not a nicety on a tablist — it is what the pattern
    means. A tablist is one tab stop: Tab moves past the whole set, and the
    arrows move between tabs. Without this, a keyboard user gets three separate
    tab stops and the widget lies about what it is.
  */
  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const offset =
      event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0

    let nextIndex = -1
    if (offset !== 0) {
      nextIndex = (activeIndex + offset + TABS.length) % TABS.length
    } else if (event.key === 'Home') {
      nextIndex = 0
    } else if (event.key === 'End') {
      nextIndex = TABS.length - 1
    }

    if (nextIndex === -1) return

    event.preventDefault()
    setActiveId(TABS[nextIndex].id)
    tabRefs.current[nextIndex]?.focus()
  }

  return (
    <section
      id="tour"
      aria-labelledby="tour-heading"
      className="border-b border-ink-200 py-20 sm:py-24"
    >
      <Container>
        <div className="max-w-2xl">
          <p className="type-label text-brand-600">Inside the portal</p>
          <h2
            id="tour-heading"
            className="type-wide mt-4 text-3xl font-bold tracking-tight text-balance text-ink-900 sm:text-4xl"
          >
            The screens your team will actually live in
          </h2>
          <p className="mt-5 text-lg text-pretty text-ink-600">
            Not a stock dashboard. These are the real layouts, drawn with the
            product’s own type, colour and spacing.
          </p>
        </div>

        {/* ── The tab bar, drawn as register column headers ─────────────── */}
        <div
          role="tablist"
          aria-label="Product screens"
          className="mt-10 flex gap-1 overflow-x-auto border-b border-ink-200 pb-px"
        >
          {TABS.map((tab, index) => {
            const isActive = tab.id === activeId

            return (
              <button
                key={tab.id}
                ref={(node) => {
                  tabRefs.current[index] = node
                }}
                type="button"
                role="tab"
                id={`tour-tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`tour-panel-${tab.id}`}
                /*
                  Roving tabindex: exactly one tab is reachable with Tab, and
                  the arrows move between them. `-1` still allows focus() to
                  land there programmatically, which is what handleKeyDown
                  relies on.
                */
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveId(tab.id)}
                onKeyDown={handleKeyDown}
                className={cn(
                  'type-label -mb-px cursor-pointer border-b-2 px-3 py-3 whitespace-nowrap transition-colors sm:px-4',
                  isActive
                    ? 'border-accent-400 text-ink-900'
                    : 'border-transparent text-ink-500 hover:text-ink-800',
                )}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        <div
          role="tabpanel"
          id={`tour-panel-${activeId}`}
          aria-labelledby={`tour-tab-${activeId}`}
          /*
            `tabIndex={0}` because the panel holds no focusable content of its
            own: without it, a keyboard user tabbing off the tablist skips the
            panel entirely and never reaches what they just selected.
          */
          tabIndex={0}
          className="mt-8"
        >
          <p className="max-w-3xl text-pretty text-ink-600">{caption}</p>

          {/*
            `key` on the wrapper, not just on the panel: it forces React to
            remount the screen when the tab changes, which is what re-runs the
            entry animation. Without it React would reconcile one screen into
            the next and the change would happen without any transition at all.
          */}
          <div key={activeId} className="animate-rise-in mt-6">
            <Screen />
          </div>
        </div>
      </Container>
    </section>
  )
}
