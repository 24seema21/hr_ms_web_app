import { Suspense, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router'
import { Button } from '@/shared/components/ui/Button'
import { IconButton } from '@/shared/components/ui/IconButton'
import { Logo } from '@/shared/components/ui/Logo'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { ThemeToggle } from '@/shared/components/ui/ThemeToggle'
import {
  CalendarIcon,
  ClockIcon,
  CloseIcon,
  GaugeIcon,
  LogOutIcon,
  MenuIcon,
  UsersIcon,
  WalletIcon,
} from '@/shared/components/ui/icons'
import { cn } from '@/shared/lib/cn'
import { ROUTES } from '@/shared/constants/routes'
import { useAuth } from '@/features/auth/hooks/useAuth'

/*
  Why this lives in `app/` and not in `shared/components/layout/`:

  it reads auth state, which means importing from `features/auth`. The one
  structural rule of this codebase is that `shared/` never imports from
  `features/` — that is what makes circular imports impossible. `app/` sits
  above both and is allowed to compose them, so this is where a layout that
  knows who is signed in belongs.
*/

const NAV_ITEMS = [
  { to: ROUTES.DASHBOARD, label: 'Dashboard', icon: GaugeIcon },
  { to: ROUTES.EMPLOYEES, label: 'Employees', icon: UsersIcon },
  { to: ROUTES.ATTENDANCE, label: 'Attendance', icon: ClockIcon },
  { to: ROUTES.LEAVE, label: 'Leave', icon: CalendarIcon },
] as const

/*
  The modules that exist in the product but not yet in this build.

  Rendered as plain text with a "soon" tag rather than as links, because a
  navigation item that goes nowhere is worse than an absent one: it is
  keyboard-focusable, it is announced as a link, and it teaches people that
  some of this menu lies. Showing them at all is deliberate — the shape of the
  product is information, and hiding it makes the app look like it does one
  thing.
*/
const PLANNED_ITEMS = [
  { id: 'payroll', label: 'Payroll', icon: WalletIcon },
] as const

function navLinkClasses({ isActive }: { isActive: boolean }) {
  return cn(
    'flex items-center gap-3 rounded-control px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? /* The active item carries a marigold marker: the same "this cell is
           marked" language as the roster grid on the landing page. */
        'bg-brand-50 text-brand-800'
      : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900',
  )
}

/** The nav list, rendered identically in the sidebar and the mobile panel. */
function ModuleNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Main" className="flex flex-col gap-6">
      <ul className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <li key={item.to}>
            {/*
              NavLink rather than Link: it knows whether its own route is the
              active one and hands that to the className function, so the
              highlight cannot fall out of sync with the URL the way a
              hand-tracked `activeTab` state would.

              `aria-current="page"`, which NavLink sets for us, is the
              non-visual half of the same information — the tint alone tells a
              sighted user where they are and everyone else nothing.
            */}
            <NavLink to={item.to} className={navLinkClasses} onClick={onNavigate}>
              {({ isActive }) => (
                <>
                  <span
                    aria-hidden="true"
                    className={cn(
                      'h-4 w-1 shrink-0 rounded-full transition-colors',
                      isActive ? 'bg-accent-400' : 'bg-transparent',
                    )}
                  />
                  <item.icon className="h-5 w-5 shrink-0" />
                  {item.label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>

      <div>
        <p className="type-label px-4 text-ink-400">Later phases</p>
        <ul className="mt-2 flex flex-col gap-1">
          {PLANNED_ITEMS.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 px-3 py-2 text-sm text-ink-400"
            >
              <span aria-hidden="true" className="h-4 w-1 shrink-0" />
              <item.icon className="h-5 w-5 shrink-0" />
              {item.label}
              <span className="type-label ml-auto text-ink-300">soon</span>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

/**
 * The chrome every signed-in page shares: brand, navigation, sign-out.
 *
 * A layout route, so pages render inside it through `<Outlet />` and none of
 * them has to remember to include a header. Adding the third protected page
 * means adding a route and an entry above — not copying a header into a fourth
 * file that then drifts from the other three.
 *
 * Sidebar rather than a top nav bar, and that is a decision about the next
 * five screens rather than these two: a horizontal bar runs out of room at
 * about six items, which is exactly the number of modules this product is
 * heading for. A vertical rail also leaves the full window width to the tables,
 * which is what the work actually needs.
 */
export function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  /*
    Navigate away *first*, then clear the session — the order matters.

    The other way round, `logout()` sets `user` to null while a protected page
    is still mounted inside ProtectedRoute. The guard sees a logged-out user
    and redirects to /login, which is right for someone who wandered in without
    a session and wrong here: signing out should land you on the public landing
    page. Leaving the protected area before clearing state avoids the race,
    with no flash of the login form in between.
  */
  const handleLogout = async () => {
    await navigate(ROUTES.HOME, { replace: true })
    await logout()
  }

  return (
    <div className="min-h-dvh bg-shell lg:grid lg:grid-cols-[16rem_1fr]">
      <a
        href="#workspace"
        className="sr-only rounded-control bg-brand-600 px-4 py-2 text-sm font-medium text-on-brand focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-60"
      >
        Skip to content
      </a>

      {/* ── Sidebar (desktop) ──────────────────────────────────────────── */}
      <div className="hidden border-r border-ink-200 bg-surface lg:flex lg:h-dvh lg:flex-col lg:sticky lg:top-0">
        <div className="flex h-16 items-center px-5">
          <NavLink to={ROUTES.DASHBOARD} aria-label="HarkHR dashboard">
            <Logo />
          </NavLink>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <ModuleNav />
        </div>

        {/*
          The signed-in identity, parked at the bottom of the rail where every
          product this audience already uses puts it. Sign-out is *not* here:
          it lives in the top bar, once, so there is exactly one of it in the
          document at any width.
        */}
        <div className="border-t border-ink-200 p-3">
          <div className="flex items-center gap-3 rounded-control px-2 py-2">
            <span
              className="type-label flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-panel text-panel-mark"
              aria-hidden="true"
            >
              {initialsOf(user?.name)}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-ink-900">
                {user?.name}
              </span>
              <span className="type-label block truncate text-ink-400">
                {user?.role}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* ── Content column ─────────────────────────────────────────────── */}
      <div className="flex min-h-dvh flex-col">
        <header className="sticky top-0 z-40 border-b border-ink-200 bg-surface/90 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              {/*
                `aria-expanded` and `aria-controls` are what make this a
                disclosure rather than a mystery: a screen reader announces
                "expanded"/"collapsed" and can jump to the panel it controls.
              */}
              <IconButton
                label={isMobileNavOpen ? 'Close menu' : 'Open menu'}
                icon={
                  isMobileNavOpen ? (
                    <CloseIcon className="h-5 w-5" />
                  ) : (
                    <MenuIcon className="h-5 w-5" />
                  )
                }
                aria-expanded={isMobileNavOpen}
                aria-controls="mobile-nav"
                onClick={() => setIsMobileNavOpen((open) => !open)}
                className="lg:hidden"
              />

              <span className="lg:hidden">
                <Logo />
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Hidden on small screens: the sign-out button earns the width
                  first, and the same address is in the sidebar. */}
              <span className="hidden text-sm text-ink-600 sm:inline">
                {user?.email}
              </span>

              {/*
                Top right, beside sign-out — the corner people already look in
                for account-level switches, and the one place in the chrome
                that is on screen for every signed-in page. It keeps its width
                on a phone: an icon-only control is cheap, and the theme is
                more likely to be changed on a phone at night, not less.
              */}
              <ThemeToggle />

              <Button variant="secondary" size="sm" onClick={handleLogout}>
                <LogOutIcon className="h-4 w-4" />
                Log out
              </Button>
            </div>
          </div>

          {/*
            Mounted only while open, so the links inside cannot be tabbed into
            — or found by a query — while the panel is closed. A permanently
            rendered panel hidden with `display:none` is the usual way a second
            copy of every nav item ends up in the accessibility tree.
          */}
          {isMobileNavOpen && (
            <div
              id="mobile-nav"
              className="animate-fade-in border-t border-ink-200 px-3 py-4 lg:hidden"
            >
              <ModuleNav onNavigate={() => setIsMobileNavOpen(false)} />
            </div>
          )}
        </header>

        <main id="workspace" className="flex-1">
          {/*
            A second Suspense boundary, inside the shell.

            App.tsx already has one around the whole router, but it would
            replace the entire screen — sidebar included — while the next
            page's chunk downloads. Catching the suspension here keeps the
            navigation visible and only the content area swaps, which is what
            makes a code-split app feel like one page rather than a series of
            reloads.

            The fallback is a skeleton of the page that is coming rather than a
            spinner, for the same reason the tables use one: the layout should
            already be settled when the content lands.
          */}
          <Suspense
            fallback={
              <div className="px-4 py-8 sm:px-6" aria-busy="true">
                <span className="sr-only" role="status">
                  Loading page…
                </span>
                <Skeleton className="h-8 w-56" />
                <Skeleton className="mt-3 h-4 w-72" />
                <Skeleton className="mt-8 h-64 w-full rounded-card" />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}

/**
 * `Asha Rao` → `AR`, for the identity tile.
 *
 * Deliberately not imported from the employees feature: a *signed-in user* and
 * an *employee record* are different things that happen to both have names
 * today, and coupling the shell to a feature's helper would make the shell
 * break when that feature's model changes.
 */
function initialsOf(name: string | undefined): string {
  if (!name) return '·'

  const [first = '', second = ''] = name.trim().split(/\s+/)
  return (first.charAt(0) + second.charAt(0)).toUpperCase() || '·'
}
