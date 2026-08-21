import { Link, Navigate } from 'react-router'
import { AuroraBackdrop } from '@/shared/components/layout/AuroraBackdrop'
import { Logo } from '@/shared/components/ui/Logo'
import { CheckIcon } from '@/shared/components/ui/icons'
import { ROUTES } from '@/shared/constants/routes'
import { LoginForm } from '../components/LoginForm'
import { useAuth } from '../hooks/useAuth'

const HIGHLIGHTS = [
  { id: 'directory', text: 'Every employee record in one searchable place' },
  { id: 'approvals', text: 'Leave and attendance approvals in two taps' },
  { id: 'payroll', text: 'Payroll that reconciles itself at month end' },
] as const

export function LoginPage() {
  const { user } = useAuth()

  /*
    Someone already signed in has no business on the login page. Rendering
    <Navigate> is the declarative way to redirect — the alternative,
    `useEffect(() => navigate(...))`, renders the login form for one frame
    first, which the user sees as a flash.
  */
  if (user) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  return (
    /*
      `nx-root` is the whole reason this page needed no new components.

      The form below is the product's shared `TextField` and `Button`, entirely
      unchanged. The class re-points the semantic tokens they read — surface,
      ink, brand, the control radius, the card shadow — to the v2 palette for
      this subtree, so the inputs, the focus rings and the primary button all
      arrive in jade on the new ground without a prop being threaded anywhere.
      See the block in index.css.

      `isolate` gives the aurora a stacking context to sit at the bottom of.
    */
    <div className="nx-root relative isolate min-h-dvh bg-nx-bg text-nx-ink">
      <AuroraBackdrop />

      {/*
        `lg:grid-cols-2` only from the large breakpoint up. Below it the grid is
        a single column and the brand panel is dropped entirely — the "stacked
        on mobile, side by side on desktop" layout, with no duplicated markup
        and no JavaScript measuring the viewport.
      */}
      <div className="relative z-10 grid min-h-dvh lg:grid-cols-2">
        {/* ── Brand panel ───────────────────────────────────────────────── */}
        {/*
          Hidden below `lg` rather than compacted.

          Stacking a marketing panel above a login form on a phone means the
          first thing between somebody and the thing they came to do is an
          advertisement for the product they already use. The form column
          carries its own logo at that width, so nothing is actually lost.
        */}
        <section className="relative hidden overflow-hidden bg-linear-to-br from-[#0b3f33] via-[#123a5c] to-[#2b2560] p-12 lg:flex lg:flex-col lg:justify-between">
          {/* The same two lights and the same grain as the closing panel on the
              landing page — one motif, two surfaces, so they read as one
              product rather than as two pages that happen to share a logo. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -left-16 h-80 w-80 rounded-full bg-nx-jade opacity-30 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -bottom-24 h-80 w-80 rounded-full bg-nx-violet opacity-30 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="nx-noise pointer-events-none absolute inset-0 opacity-[0.05]"
          />

          <Link
            to={ROUTES.HOME}
            aria-label="Unity Portal home"
            className="relative w-fit rounded-full"
          >
            <Logo tone="light" />
          </Link>

          <div className="relative max-w-md">
            {/*
              An <h2>, not an <h1>. The page's single top-level heading belongs
              to the form — that is what the page is *for* — and a decorative
              welcome outranking it would leave a screen-reader user with the
              wrong answer to "what is this page?".
            */}
            <h2 className="type-tight text-4xl font-extrabold tracking-tight text-balance text-white">
              Welcome back
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-pretty text-white/70">
              Sign in to pick up where your team left off.
            </p>

            <ul className="mt-9 space-y-4">
              {HIGHLIGHTS.map((item) => (
                <li key={item.id} className="flex items-start gap-3">
                  <span
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/15 text-white"
                    aria-hidden="true"
                  >
                    <CheckIcon className="h-3 w-3" />
                  </span>
                  <span className="text-sm text-white/80">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="relative font-mono text-xs text-white/40">
            © {new Date().getFullYear()} Unity Portal
          </p>
        </section>

        {/* ── Form panel ────────────────────────────────────────────────── */}
        <main className="flex items-center justify-center px-5 py-12 sm:px-10">
          <div className="w-full max-w-md">
            {/* The logo the hidden panel would have carried, at the widths
                where the panel is not there. */}
            <Link
              to={ROUTES.HOME}
              aria-label="Unity Portal home"
              className="mb-8 flex w-fit items-center gap-2.5 lg:hidden"
            >
              <Logo markOnly />
              <span className="type-tight text-[1.0625rem] font-extrabold tracking-tight text-nx-ink">
                Unity <span className="text-nx-jade-ink">Portal</span>
              </span>
            </Link>

            {/*
              The form sits on a raised card rather than directly on the page.

              On a plain ground the aurora runs straight under the inputs, and a
              soft violet wash behind a text field is the kind of thing that
              looks considered in a mock-up and reads as a rendering bug on a
              real screen. The card is also what makes the one thing you came
              here to do the one solid object in front of you.
            */}
            <div className="rounded-nx-lg border border-nx-line bg-nx-surface p-6 shadow-nx-lift sm:p-9">
              {/* The page's single <h1>. */}
              <h1 className="type-tight text-2xl font-extrabold tracking-tight text-nx-ink">
                Sign in to Unity Portal
              </h1>
              <p className="mt-2 text-sm text-nx-muted">
                Enter your work email and password to continue.
              </p>

              {/*
                The demo-credentials panel that used to sit here is gone:
                sign-in now runs against the real backend, and accounts come
                from the `users` table. Printing working credentials on a real
                login page is not a shortcut worth keeping.
              */}
              <div className="mt-8">
                <LoginForm />
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-nx-muted">
              <Link
                to={ROUTES.HOME}
                className="rounded-full font-semibold text-nx-jade-ink transition-colors hover:text-nx-jade"
              >
                ← Back to home
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
