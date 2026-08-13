import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { ThemeProvider } from '@/shared/context/ThemeProvider'
import { FEATURES } from '../data/features'
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
})
