/*
  ─────────────────────────────────────────────────────────────────────────────
  THE CHAPTERS
  ─────────────────────────────────────────────────────────────────────────────
  The page's argument, named once and read by three different things: the flow
  rail down the side, the header's nav, and the footer's link list.

  This list existing at all is the structural difference between this page and
  the current one. There, the section order lives in the page component and the
  nav links are retyped in the header and again in the footer — three lists
  that agree by convention. Here the order *is* data, so a section cannot be
  added to the page without appearing in the rail, and cannot be renamed in one
  place and stay stale in the other two.

  `id` is the DOM id of the corresponding <section>, which is what both the
  anchor links and the scroll spy match on. Keep them in the order they appear
  on the page: the rail draws progress from it, and the spy resolves ties by
  taking the first entry that is on screen.
*/
export interface Section {
  id: string
  /** Short enough for a rail chip — one or two words. */
  label: string
  /** The question this chapter answers, shown in the footer's site map. */
  blurb: string
}

export const SECTIONS: readonly Section[] = [
  { id: 'start', label: 'Start', blurb: 'What Unity Portal is' },
  { id: 'lifecycle', label: 'Lifecycle', blurb: 'Joining through to exit' },
  { id: 'modules', label: 'Modules', blurb: 'Eleven, on one record' },
  { id: 'screens', label: 'Screens', blurb: 'What you look at all day' },
  { id: 'assist', label: 'AI assist', blurb: 'What it does, and cannot do' },
  { id: 'pricing', label: 'Pricing', blurb: 'What each tier unlocks' },
  { id: 'rollout', label: 'Rollout', blurb: 'How you get yours going' },
]

/**
 * Just the ids, hoisted to module scope.
 *
 * `useScrollSpy` takes this as a dependency, so it has to be a stable
 * reference — deriving it inside a component with `.map()` would build a new
 * array on every render and tear down the IntersectionObserver each time.
 */
export const SECTION_IDS: readonly string[] = SECTIONS.map(
  (section) => section.id,
)

/**
 * The subset that earns a place in the header, where there is room for four.
 *
 * Filtered from the same source rather than retyped: rename a section and the
 * header follows. "Start" and "Lifecycle" are dropped because the logo already
 * goes to the top and the lifecycle is the first thing under the fold anyway.
 */
export const HEADER_SECTIONS = SECTIONS.filter((section) =>
  ['modules', 'screens', 'assist', 'pricing'].includes(section.id),
)
