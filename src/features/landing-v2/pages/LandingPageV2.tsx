import { AuroraBackdrop } from '@/shared/components/layout/AuroraBackdrop'
import { AiAndTrust } from '../components/AiAndTrust'
import { CtaBanner } from '../components/CtaBanner'
import { FlowRail } from '../components/FlowRail'
import { Hero } from '../components/Hero'
import { Lifecycle } from '../components/Lifecycle'
import { ModuleBoard } from '../components/ModuleBoard'
import { Plans } from '../components/Plans'
import { ProductTour } from '../components/ProductTour'
import { Rollout } from '../components/Rollout'
import { SiteFooter } from '../components/SiteFooter'
import { SiteHeader } from '../components/SiteHeader'

/**
 * The v2 landing page — a candidate design, live alongside the current one at
 * `/v2` so the two can be judged in the same browser at the same width.
 *
 * Same content, different argument *shape*. The copy, the module list and the
 * pricing all come from the existing data files; what changed is the visual
 * language (luminous surfaces over an aurora field, in place of ruled paper)
 * and the way the structure is exposed — a persistent flow rail, a filterable
 * module board, and sections that assemble as you reach them.
 *
 * Like the page it competes with, this file is pure composition: it decides
 * the *order* of the sections and nothing else. That is what keeps each
 * section small enough to read in one screenful and swappable on its own.
 *
 * The order is an argument, read top to bottom, and it is the order a buyer
 * asks the questions in rather than the order the modules were built in:
 *
 *   Hero        here is the register everything writes into
 *   Lifecycle   here is how much of the employment it covers
 *   ModuleBoard here is every module, and how finished each one is
 *   ProductTour here is what you would actually be looking at all day
 *   AiAndTrust  here is what the AI does, and what it is not allowed to do
 *   Plans       here is what it costs and what the tier unlocks
 *   Rollout     here is how you get yours going
 *   CtaBanner   here is the way in
 *
 * That order also lives in `data/sections.ts`, which is what the flow rail and
 * both navs read. Adding a section means adding it here *and* there — the one
 * piece of duplication in the design, and the cheapest place to put it: a
 * section missing from the rail is visible the moment you scroll past it.
 */
export function LandingPageV2() {
  return (
    /*
      `nx-root` re-points the product's semantic tokens to this palette for the
      whole subtree (see index.css), which is what puts the shared controls
      this page borrows — the theme toggle, and anything added later — in the
      v2 colours without either of them knowing.

      `isolate` creates a stacking context, so the aurora's `z-0` and the
      content's `z-10` are settled here rather than against whatever the rest
      of the document is doing. `min-h-dvh` keeps the page ground covering the
      viewport even before the content fills it.
    */
    <div className="nx-root relative isolate min-h-dvh bg-nx-bg text-nx-ink">
      <AuroraBackdrop />

      {/*
        The skip link: the first thing a keyboard user reaches, and invisible
        until it has focus. Without it, getting to the content means tabbing
        through the header *and* the seven-stop flow rail on every page load —
        which is the accessibility cost of the rail, paid here.
      */}
      <a
        href="#main"
        className="sr-only rounded-full bg-nx-jade px-4 py-2 text-sm font-semibold text-nx-on-fill focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-60"
      >
        Skip to content
      </a>

      <SiteHeader />
      <FlowRail />

      {/*
        `<main>` marks the primary content, which is what lets a screen-reader
        user skip the header in one keystroke. There must be exactly one per
        page, and the header, rail and footer all belong outside it.
      */}
      <main id="main" className="relative z-10">
        <Hero />
        <Lifecycle />
        <ModuleBoard />
        <ProductTour />
        <AiAndTrust />
        <Plans />
        <Rollout />
        <CtaBanner />
      </main>

      <SiteFooter />
    </div>
  )
}
