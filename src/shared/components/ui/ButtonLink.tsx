import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { buttonClasses } from './buttonStyles'
import type { ButtonSize, ButtonVariant } from './buttonStyles'

interface ButtonLinkProps {
  /** An in-app route (`/login`) or an in-page anchor (`#features`). */
  to: string
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  'aria-label'?: string
}

/**
 * Looks like a button, behaves like a link.
 *
 * The distinction matters: a link navigates, so it must be an `<a>` — that is
 * what gives it a URL you can copy, open in a new tab, or reach with the
 * screen-reader "list all links" command. A `<button onClick={navigate}>`
 * looks the same and loses all of it.
 *
 * In-page anchors (`#features`) use a plain `<a>`; routes go through
 * react-router's `<Link>`, which swaps the page without a full browser reload.
 */
export function ButtonLink({
  to,
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...rest
}: ButtonLinkProps) {
  const classes = buttonClasses(variant, size, className)

  if (to.startsWith('#')) {
    return (
      <a href={to} className={classes} {...rest}>
        {children}
      </a>
    )
  }

  return (
    <Link to={to} className={classes} {...rest}>
      {children}
    </Link>
  )
}
