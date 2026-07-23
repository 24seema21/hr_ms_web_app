import { Link, Navigate } from 'react-router'
import { Logo } from '@/shared/components/ui/Logo'
import { ROUTES } from '@/shared/constants/routes'
import { LoginForm } from '../components/LoginForm'
import { useAuth } from '../hooks/useAuth'
import { DEMO_CREDENTIALS } from '../api/authApi'

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
      `lg:grid-cols-2` only from the large breakpoint up. Below it the grid is
      a single column and the brand panel simply sits above the form — the
      "stacked on mobile, side by side on desktop" layout, with no duplicated
      markup and no JavaScript measuring the viewport.
    */
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* ── Brand panel ─────────────────────────────────────────────── */}
      <section className="flex flex-col justify-between gap-12 bg-brand-700 px-6 py-10 sm:px-12 lg:py-14">
        <Link to={ROUTES.HOME} aria-label="HarkHR home" className="w-fit">
          {/*
            The default Logo renders dark text, which would vanish on this
            band — so here we use the mark alone next to white wordmark text.
          */}
          <span className="inline-flex items-center gap-2">
            <Logo markOnly />
            <span className="text-lg font-semibold tracking-tight text-white">
              HarkHR
            </span>
          </span>
        </Link>

        <div className="max-w-md">
          <h2 className="text-3xl font-bold tracking-tight text-balance text-white sm:text-4xl">
            Welcome back
          </h2>
          <p className="mt-4 text-pretty text-brand-100">
            Sign in to pick up where your team left off.
          </p>

          <ul className="mt-8 space-y-3">
            {HIGHLIGHTS.map((item) => (
              <li key={item.id} className="flex items-start gap-3 text-brand-50">
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="mt-0.5 h-5 w-5 shrink-0 text-brand-300"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.25 7.3a1 1 0 0 1-1.42 0l-3.75-3.78a1 1 0 1 1 1.42-1.408l3.04 3.063 6.54-6.585a1 1 0 0 1 1.414-.005Z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm text-brand-200">
          © {new Date().getFullYear()} HarkHR
        </p>
      </section>

      {/* ── Form panel ──────────────────────────────────────────────── */}
      <main className="flex items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-md">
          {/*
            The page's single <h1>. The brand panel's "Welcome back" is an
            <h2> precisely so that this — the actual purpose of the page —
            stays the top-level heading.
          */}
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">
            Sign in to HarkHR
          </h1>
          <p className="mt-2 text-sm text-ink-600">
            Enter your work email and password to continue.
          </p>

          {/*
            Demo credentials on screen: without a real backend this is the only
            way the login flow can be tried. Delete this block the moment a
            real auth service is connected.
          */}
          <div className="mt-6 rounded-control border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-900">
            <p className="font-semibold">Demo account</p>
            <p className="mt-1">
              <code className="font-mono">{DEMO_CREDENTIALS.email}</code>
              {' · '}
              <code className="font-mono">{DEMO_CREDENTIALS.password}</code>
            </p>
          </div>

          <div className="mt-8">
            <LoginForm />
          </div>

          <p className="mt-8 text-center text-sm text-ink-600">
            <Link
              to={ROUTES.HOME}
              className="font-medium text-brand-700 hover:text-brand-800"
            >
              ← Back to home
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
