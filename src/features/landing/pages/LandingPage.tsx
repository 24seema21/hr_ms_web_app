import { SiteHeader } from '../components/SiteHeader'
import { Hero } from '../components/Hero'
import { FeatureGrid } from '../components/FeatureGrid'
import { HowItWorks } from '../components/HowItWorks'
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
 */
export function LandingPage() {
  return (
    <>
      <SiteHeader />
      {/*
        `<main>` marks the primary content, which is what lets a screen-reader
        user skip the header in one keystroke. There must be exactly one per
        page, and the header/footer belong outside it.
      */}
      <main>
        <Hero />
        <FeatureGrid />
        <HowItWorks />
        <CtaBanner />
      </main>
      <SiteFooter />
    </>
  )
}
