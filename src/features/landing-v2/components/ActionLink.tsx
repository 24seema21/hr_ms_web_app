import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { actionClasses } from '../lib/actionClasses'
import type { ActionSize, ActionVariant } from '../lib/actionClasses'

interface ActionLinkProps {
  /** An in-app route (`/login`) or an in-page anchor (`#modules`). */
  to: string
  children: ReactNode
  variant?: ActionVariant
  size?: ActionSize
  className?: string
}

/**
 * Looks like a button, behaves like a link — the v2 palette's version of the
 * product's `ButtonLink`.
 *
 * Every call to action on this page navigates, so every one of them is a real
 * `<a>`: that is what gives it a URL you can copy, middle-click into a new
 * tab, or find with a screen reader's "list all links". A styled
 * `<button onClick={navigate}>` looks identical and loses all three.
 *
 * In-page anchors stay plain `<a>` — react-router's `<Link>` would treat
 * `#modules` as a route and try to navigate to it.
 */
export function ActionLink({
  to,
  children,
  variant = 'primary',
  size = 'md',
  className,
}: ActionLinkProps) {
  const classes = actionClasses(variant, size, className)

  if (to.startsWith('#')) {
    return (
      <a href={to} className={classes}>
        {children}
      </a>
    )
  }

  return (
    <Link to={to} className={classes}>
      {children}
    </Link>
  )
}
