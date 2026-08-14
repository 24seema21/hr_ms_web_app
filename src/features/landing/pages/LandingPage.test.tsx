import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { ThemeProvider } from '@/shared/context/ThemeProvider'
import { FEATURES } from '../data/features'
import { PLANS } from '../data/plans'
import { LandingPage } from './LandingPage'

/*
  A smoke test, on purpose.

  Asserting the exact marketing copy would mean editing this file every time
  someone rewords a headline — a test that fails for non-bugs gets ignored,
  and an ignored suite is worse than no suite. So we assert the things that
  are actually contracts: the page renders, it has one top-level heading, the
  sign-in route is correct, and every module is listed.
*/
/*
  ThemeProvider is part of the page's environment, not an implementation
  detail: the header carries the theme toggle, and `useTheme` throws rather
  than guessing when there is no provider above it. Rendering the page without
  one tests a tree the app never actually builds.
*/
function renderLandingPage() {
  return render(
    <ThemeProvider>
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    </ThemeProvider>,
  )
}

describe('LandingPage', () => {
  it('renders exactly one top-level heading', () => {
    renderLandingPage()

    // `getAllByRole` then a length check, rather than `getByRole` — this way a
    // second <h1> creeping in fails loudly instead of throwing a confusing
    // "multiple elements found" error.
    const headings = screen.getAllByRole('heading', { level: 1 })
    expect(headings).toHaveLength(1)
    expect(headings[0]).toBeVisible()
  })

  it('points every sign-in link at the login route', () => {
    renderLandingPage()

    const signInLinks = screen.getAllByRole('link', { name: /sign in/i })
    expect(signInLinks.length).toBeGreaterThan(0)
    for (const link of signInLinks) {
      expect(link).toHaveAttribute('href', '/login')
    }
  })

  it('lists every HRMS module from the feature data', () => {
    renderLandingPage()

    // Driven by the data source, so adding a module to features.ts extends
    // this test automatically instead of leaving a silent gap.
    for (const feature of FEATURES) {
      expect(
        screen.getByRole('heading', { name: feature.title, level: 3 }),
      ).toBeInTheDocument()
    }
  })

  it('exposes the header, main and footer landmarks', () => {
    renderLandingPage()

    // These are what let a screen-reader user skip straight to the content.
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('names every subscription tier', () => {
    renderLandingPage()

    for (const plan of PLANS) {
      // Twice each: once as a pricing card, once as a matrix column. Both are
      // load-bearing, so assert the count rather than just "at least one".
      expect(screen.getAllByText(plan.name).length).toBeGreaterThanOrEqual(2)
    }
  })

  /*
    The tour is the only interactive thing on an otherwise static page, so it
    is the only thing here worth a behavioural test. What is asserted is the
    tab *contract* — one panel at a time, and the arrow keys move between
    tabs — not which screen happens to be first.
  */
  describe('product tour', () => {
    it('shows one panel at a time and switches on click', async () => {
      const user = userEvent.setup()
      renderLandingPage()

      const tablist = screen.getByRole('tablist', { name: /product screens/i })
      const tabs = within(tablist).getAllByRole('tab')
      expect(tabs.length).toBeGreaterThan(1)

      // Exactly one panel is mounted, so hidden screens are never announced.
      expect(screen.getAllByRole('tabpanel')).toHaveLength(1)
      expect(tabs[0]).toHaveAttribute('aria-selected', 'true')

      await user.click(tabs[1])
      expect(tabs[1]).toHaveAttribute('aria-selected', 'true')
      expect(tabs[0]).toHaveAttribute('aria-selected', 'false')
      expect(screen.getAllByRole('tabpanel')).toHaveLength(1)
    })

    it('is one tab stop, with the arrow keys moving between tabs', async () => {
      const user = userEvent.setup()
      renderLandingPage()

      const tablist = screen.getByRole('tablist', { name: /product screens/i })
      const tabs = within(tablist).getAllByRole('tab')

      // Roving tabindex: only the selected tab is reachable with Tab.
      expect(tabs[0]).toHaveAttribute('tabindex', '0')
      expect(tabs[1]).toHaveAttribute('tabindex', '-1')

      tabs[0].focus()
      await user.keyboard('{ArrowRight}')
      expect(tabs[1]).toHaveFocus()
      expect(tabs[1]).toHaveAttribute('aria-selected', 'true')

      // And it wraps, rather than dead-ending at the last tab.
      await user.keyboard('{ArrowLeft}{ArrowLeft}')
      expect(tabs[tabs.length - 1]).toHaveFocus()
    })
  })
})
