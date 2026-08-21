/**
 * Every URL in the app, in one place.
 *
 * Why an object literal with `as const` instead of a TypeScript `enum`:
 * this project sets `erasableSyntaxOnly: true` in tsconfig.app.json, which
 * bans `enum` outright (an enum compiles down to real runtime JavaScript,
 * so it cannot simply be erased). `as const` gives us the same benefit —
 * `ROUTES.LOGIN` is autocompleted and a typo is a compile error — while
 * staying plain, erasable TypeScript.
 */
export const ROUTES = {
  HOME: '/',
  /*
    The *previous* landing design, parked here after the v2 page was promoted
    to HOME. Public and unguarded on purpose — the point is to be able to open
    both in one browser and flip between them.

    The name reads backwards now, deliberately left alone rather than renamed:
    this route is temporary, and it goes together with the `features/landing`
    slice as soon as the comparison stops being useful. Nothing links to it
    except the footer of the page it is being compared against.
  */
  LANDING_V2: '/v2',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  EMPLOYEES: '/employees',
  ATTENDANCE: '/attendance',
  LEAVE: '/leave',
  SETTINGS: '/settings',
} as const

/**
 * `typeof ROUTES` is the object's type; `[keyof typeof ROUTES]` looks up the
 * type of every value in it. Result: '/' | '/login' | '/dashboard'.
 * Add a route above and this union widens automatically.
 */
export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]
