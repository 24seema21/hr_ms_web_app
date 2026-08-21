import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { ThemeProvider } from '@/shared/context/ThemeProvider'
import { FEATURES } from '@/features/landing/data/features'
import { PLANS } from '@/features/landing/data/plans'
import { LandingPageV2 } from './LandingPageV2'

/*
  A smoke test, on purpose — the same contract-not-copy line the current
  landing page's suite draws.

  Asserting marketing wording would mean editing this file every time somebody
  rewords a headline, and a test that fails for non-bugs gets ignored. What is
  asserted here is what is actually load-bearing: the page renders, it has one
  top-level heading, sign-in goes to the login route, every module and tier
  from the shared data appears, and the two interactive widgets behave.

  ThemeProvider is part of the page's environment rather than an
  implementation detail: the header carries the theme toggle, and `useTheme`
  throws instead of guessing when there is no provider above it.
*/
function renderPage() {
  return render(
    <ThemeProvider>
      <MemoryRouter>
        <LandingPageV2 />
      </MemoryRouter>
    </ThemeProvider>,
  )
}

describe('LandingPageV2', () => {
  it('renders exactly one top-level heading', () => {
    renderPage()

    // `getAllByRole` then a length check, rather than `getByRole` — a second
    // <h1> creeping in should fail loudly rather than throw a confusing
    // "multiple elements found".
    const headings = screen.getAllByRole('heading', { level: 1 })
    expect(headings).toHaveLength(1)
    expect(headings[0]).toBeVisible()
  })

  it('points every sign-in link at the login route', () => {
    renderPage()

    const signInLinks = screen.getAllByRole('link', { name: /sign in/i })
    expect(signInLinks.length).toBeGreaterThan(0)
    for (const link of signInLinks) {
      expect(link).toHaveAttribute('href', '/login')
    }
  })

  it('exposes the header, main, footer and flow-rail landmarks', () => {
    renderPage()

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    // The rail is the page's structural device; it has to be reachable as a
    // navigation landmark, not just visible.
    expect(
      screen.getByRole('navigation', { name: /page sections/i }),
    ).toBeInTheDocument()
  })

  it('names every subscription tier', () => {
    renderPage()

    for (const plan of PLANS) {
      // Twice each: once as a pricing card, once as a matrix column. Both are
      // load-bearing, so assert the count rather than just "at least one".
      expect(screen.getAllByText(plan.name).length).toBeGreaterThanOrEqual(2)
    }
  })

  /*
    The module board and the tour are the only interactive things on an
    otherwise static page, so they are the only two worth behavioural tests.
  */
  describe('module board', () => {
    it('lists every module from the shared feature data by default', () => {
      renderPage()

      // Driven by the data source, so adding a module to features.ts extends
      // this test automatically instead of leaving a silent gap.
      for (const feature of FEATURES) {
        expect(
          screen.getByRole('heading', { name: feature.title, level: 3 }),
        ).toBeInTheDocument()
      }
    })

    it('narrows the board to one build status and back', async () => {
      const user = userEvent.setup()
      renderPage()

      const group = screen.getByRole('group', { name: /filter modules/i })
      const liveFilter = within(group).getByRole('button', { name: /^live/i })

      await user.click(liveFilter)
      expect(liveFilter).toHaveAttribute('aria-pressed', 'true')

      /*
        Assert against the data rather than against a hand-picked module name:
        move a module from `building` to `live` in features.ts and this test
        keeps testing the filter instead of failing on a content change.
      */
      for (const feature of FEATURES) {
        const heading = screen.queryByRole('heading', {
          name: feature.title,
          level: 3,
        })
        if (feature.status === 'live') expect(heading).toBeInTheDocument()
        else expect(heading).not.toBeInTheDocument()
      }

      await user.click(within(group).getByRole('button', { name: /everything/i }))
      expect(liveFilter).toHaveAttribute('aria-pressed', 'false')
      expect(
        screen.getByRole('heading', { name: FEATURES[0].title, level: 3 }),
      ).toBeInTheDocument()
    })
  })

  describe('product tour', () => {
    it('shows one panel at a time and switches on click', async () => {
      const user = userEvent.setup()
      renderPage()

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
      renderPage()

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
