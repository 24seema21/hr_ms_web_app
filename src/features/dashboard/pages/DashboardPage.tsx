import { ButtonLink } from '@/shared/components/ui/ButtonLink'
import { Badge } from '@/shared/components/ui/Badge'
import {
  CalendarIcon,
  UsersIcon,
  WalletIcon,
} from '@/shared/components/ui/icons'
import { ROUTES } from '@/shared/constants/routes'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { AttendanceCard } from '@/features/attendance/components/AttendanceCard'

/*
  The modules, and what is actually behind each one today.

  `to: null` means the screen does not exist yet, and the card says so instead
  of linking somewhere that 404s. Being straight about what is built is worth
  more than a grid of tiles that all look equally real.
*/
const MODULES = [
  {
    id: 'directory',
    title: 'Employee directory',
    description:
      'Add, edit and remove the people in your organisation. Backed by the live /employee API.',
    icon: UsersIcon,
    to: ROUTES.EMPLOYEES,
  },
  /*
    No attendance tile: the card above *is* attendance, and a "later phase"
    badge under a working check-in button is the kind of contradiction that
    makes people distrust the rest of the page. The tile comes back in phase 3b
    pointing at /attendance, when there is a history page behind it.
  */
  {
    id: 'leave',
    title: 'Leave',
    description: 'Balances, requests and approvals routed to the right manager.',
    icon: CalendarIcon,
    to: null,
  },
  {
    id: 'payroll',
    title: 'Payroll',
    description:
      'Salary structures and statutory deductions, calculated from attendance.',
    icon: WalletIcon,
    to: null,
  },
] as const

/**
 * The landing pad after sign-in.
 *
 * Deliberately static: it links to the modules and greets the signed-in user,
 * and it does not fetch anything. A dashboard that opens with four API calls
 * is four chances to greet somebody with an error message — and every number
 * worth showing here (headcount, absences, payroll status) belongs to a module
 * that does not exist yet. It will earn its data when there is data to earn.
 *
 * The header, navigation and sign-out button come from `AppShell`, so this
 * page — and every page after it — does not grow its own copy.
 */
export function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="mx-auto w-full max-w-[92rem] px-4 py-8 sm:px-6 lg:px-8">
      <p className="type-label text-brand-600">Workspace</p>
      <h1 className="type-wide mt-1.5 text-2xl font-bold tracking-tight text-ink-900">
        {/*
          `user?.name` — the optional chain is belt-and-braces. ProtectedRoute
          guarantees a user by the time this renders, but the type does not
          know that, and a guard is cheaper than a crash.
        */}
        Welcome back, {user?.name}
      </h1>
      <p className="mt-1.5 text-sm text-ink-600">
        Signed in as {user?.email} ·{' '}
        <span className="font-medium text-ink-800">{user?.role}</span>
      </p>

      {/*
        Attendance comes first, and nothing shares its row.

        It is the only thing on this page somebody has to *do* — twice a day,
        every day — and everything below it is navigation. A dashboard that
        opens with four equal tiles makes the daily action the same size as a
        link to a module that does not exist yet.
      */}
      <div className="mt-8">
        <AttendanceCard />
      </div>

      <h2 className="type-label mt-10 text-ink-500">Modules</h2>

      <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {MODULES.map((module) => (
          <li
            key={module.id}
            className="flex flex-col rounded-card border border-ink-200 bg-surface p-6 shadow-card"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-control bg-brand-50 text-brand-600">
              <module.icon className="h-5 w-5" />
            </span>

            <h2 className="type-wide mt-4 text-base font-semibold text-ink-900">
              {module.title}
            </h2>
            <p className="mt-2 flex-1 text-sm text-pretty text-ink-600">
              {module.description}
            </p>

            <div className="mt-5">
              {module.to ? (
                /*
                  A ButtonLink, not a Button with an onClick that navigates.
                  This goes somewhere, so it must be a real `<a>`: middle-click
                  to open in a tab, right-click to copy the address, and a
                  screen reader announcing "link" rather than "button" all
                  follow from using the right element.
                */
                <ButtonLink to={module.to} size="sm">
                  Open directory
                </ButtonLink>
              ) : (
                /* A badge, not a disabled button: there is no action to
                   disable, and a greyed-out button invites clicking. */
                <Badge mono>Later phase</Badge>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
