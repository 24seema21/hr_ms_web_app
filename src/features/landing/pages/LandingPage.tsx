import { SiteHeader } from '../components/SiteHeader'
import { Hero } from '../components/Hero'
import { ModuleIndex } from '../components/ModuleIndex'
import { Rollout } from '../components/Rollout'
import { CtaBanner } from '../components/CtaBanner'
import { SiteFooter } from '../components/SiteFooter'

/**
 * The page is pure composition — it decides the *order* of the sections and
 * nothing else.
 *
 * That is the whole point of splitting it up: this file tells you the shape of
 * the page in six lines, and each section stays small enough to read in one
 * screenful. A single 500-line LandingPage.tsx would tell you nothing at a
 * glance and could not be reused or tested in pieces.
 *
 * The order is an argument, read top to bottom: here is the register (Hero),
 * here is what writes into it (ModuleIndex), here is how you get yours going
 * (Rollout), here is the way in (CtaBanner).
 */
export function LandingPage() {
  return (
    <>
      {/*
        The skip link: the first thing a keyboard user reaches on the page, and
        invisible until it has focus. Without it, getting to the content means
        tabbing through the whole header on every page load.
      */}
      <a
        href="#main"
        className="sr-only rounded-control bg-brand-600 px-4 py-2 text-sm font-medium text-on-brand focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-60"
      >
        Skip to content
      </a>

      <SiteHeader />

      {/*
        `<main>` marks the primary content, which is what lets a screen-reader
        user skip the header in one keystroke. There must be exactly one per
        page, and the header/footer belong outside it.
      */}
      <main id="main">
        <Hero />
        <ModuleIndex />
        <Rollout />
        <CtaBanner />
      </main>

      <SiteFooter />
    </>
  )
}
