import { SiteHeader } from '../components/SiteHeader'
import { Hero } from '../components/Hero'
import { Lifecycle } from '../components/Lifecycle'
import { ModuleIndex } from '../components/ModuleIndex'
import { ProductTour } from '../components/ProductTour'
import { AiAndTrust } from '../components/AiAndTrust'
import { Plans } from '../components/Plans'
import { Rollout } from '../components/Rollout'
import { CtaBanner } from '../components/CtaBanner'
import { SiteFooter } from '../components/SiteFooter'

/**
 * The page is pure composition — it decides the *order* of the sections and
 * nothing else.
 *
 * That is the whole point of splitting it up: this file tells you the shape of
 * the page in ten lines, and each section stays small enough to read in one
 * screenful. A single 1,500-line LandingPage.tsx would tell you nothing at a
 * glance and could not be reused or tested in pieces.
 *
 * The order is an argument, read top to bottom — and it is the order a buyer
 * asks the questions in, not the order the modules were built in:
 *
 *   Hero        here is the register everything writes into
 *   Lifecycle   here is how much of the employment it covers
 *   ModuleIndex here is every module, and how finished each one is
 *   ProductTour here is what you would actually be looking at all day
 *   AiAndTrust  here is what the AI does, and what it is not allowed to do
 *   Plans       here is what it costs and what the tier unlocks
 *   Rollout     here is how you get yours going
 *   CtaBanner   here is the way in
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
        <Lifecycle />
        <ModuleIndex />
        <ProductTour />
        <AiAndTrust />
        <Plans />
        <Rollout />
        <CtaBanner />
      </main>

      <SiteFooter />
    </>
  )
}
