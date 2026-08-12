import type { Employee } from '../types'

/*
  The database stores a first and a last name; screens, search boxes and
  confirmation messages want one string. Both conversions live here so that
  "how do we display a name?" has exactly one answer — and so the day this
  needs to respect a locale where the family name comes first, it is one
  function to change rather than six components to hunt down.
*/

/**
 * `Asha` + `Rao` → `Asha Rao`. A missing last name yields just the first,
 * with no trailing space to show up in a table cell or an aria-label.
 */
export function fullNameOf(employee: {
  firstName: string
  lastName: string
}): string {
  return [employee.firstName, employee.lastName]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(' ')
}

/**
 * `Asha Rao` → `AR`, for the avatar circle.
 *
 * Built from the two fields rather than by splitting a joined string, so
 * "Amelia Van Der Berg" gives `AV` — the initials of her first and last name —
 * instead of whatever the words happened to be either side of a space.
 */
export function initialsOf(employee: {
  firstName: string
  lastName: string
}): string {
  const first = employee.firstName.trim().charAt(0)
  const last = employee.lastName.trim().charAt(0)
  const initials = (first + last).toUpperCase()

  // A record with no name at all should still render a circle, not an empty
  // one that looks like a rendering bug.
  return initials === '' ? '?' : initials
}

/** The fields a person would plausibly search a directory by. */
export function searchableFieldsOf(employee: Employee): string[] {
  /*
    Not every field. Matching on `addressLine2` would mean typing "road"
    returns half the company, and a search that matches too much is as useless
    as one that matches too little.

    `fullNameOf` is included as well as the parts, so searching "asha rao" —
    which spans two columns — finds her.
  */
  return [
    employee.firstName,
    employee.lastName,
    fullNameOf(employee),
    employee.email,
    employee.phone,
    employee.city,
    employee.state,
    employee.country,
  ]
}
