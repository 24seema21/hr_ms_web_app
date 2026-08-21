import { Link } from 'react-router'
import { Container } from '@/shared/components/layout/Container'
import { Logo } from '@/shared/components/ui/Logo'
import { ROUTES } from '@/shared/constants/routes'
import { SECTIONS } from '../data/sections'

export function SiteFooter() {
  return (
    <footer className="relative border-t border-nx-line py-14">
      <Container>
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
          <div className="max-w-xs">
            <span className="flex items-center gap-2.5">
              <Logo markOnly />
              <span className="type-tight text-[1.0625rem] font-extrabold tracking-tight text-nx-ink">
                Unity <span className="text-nx-jade-ink">Portal</span>
              </span>
            </span>

            <p className="mt-3 text-sm text-nx-muted">
              The whole employment, on one record.
            </p>
            <p className="mt-2 text-xs text-pretty text-nx-faint">
              In active development. Modules are labelled live, in build or
              planned, and the labels are kept current.
            </p>
          </div>

          {/*
            The site map carries each section's blurb, not just its name.

            The header shows four labels because that is all that fits in a
            16px-tall row; down here there is room to say what each chapter
            answers, which is worth more to somebody who has scrolled to the
            bottom without finding what they came for.
          */}
          <nav aria-label="Footer" className="lg:max-w-lg">
            <p className="font-mono text-[0.6875rem] tracking-widest text-nx-faint uppercase">
              On this page
            </p>
            <ul className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {SECTIONS.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="group block rounded-lg text-sm font-semibold text-nx-ink transition-colors hover:text-nx-jade-ink"
                  >
                    {section.label}
                    <span className="block text-xs font-normal text-nx-faint">
                      {section.blurb}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-nx-line pt-6 sm:flex-row sm:items-center">
          <p className="text-sm text-nx-faint">
            © {new Date().getFullYear()} Unity Portal
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {/*
              The way back to the page this one is competing with.

              It exists because both designs are live at once and the only
              useful way to judge them is to flip between them in the same
              browser at the same width. It comes out with whichever page
              loses — a temporary link, deliberately left where a reader
              evaluating the *product* will never trip over it.
            */}
            <Link
              to={ROUTES.HOME}
              className="rounded-full bg-nx-violet-soft px-3 py-1.5 text-xs font-semibold text-nx-violet-ink transition-colors hover:bg-nx-violet-line"
            >
              Concept v2 · see the current page
            </Link>

            <Link
              to={ROUTES.LOGIN}
              className="text-sm font-semibold text-nx-jade-ink transition-colors hover:text-nx-jade"
            >
              Sign in
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  )
}
