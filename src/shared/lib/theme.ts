/*
  ─────────────────────────────────────────────────────────────────────────────
  THEME — the preference, and how it reaches the document
  ─────────────────────────────────────────────────────────────────────────────
  Pure functions and one storage key. No React in here, so the same logic runs
  in the inline boot script in index.html (which has to set the theme *before*
  React exists, or the page paints white and then flips).
*/

/**
 * What the user has asked for.
 *
 * `system` is a real, storable choice rather than the absence of one — "follow
 * my OS" is a preference somebody can deliberately return to, and collapsing
 * it into `null` makes that impossible to express.
 */
export const THEME_PREFERENCES = ['light', 'dark', 'system'] as const
export type ThemePreference = (typeof THEME_PREFERENCES)[number]

/** What the document actually renders as, once `system` has been resolved. */
export type ResolvedTheme = 'light' | 'dark'

/*
  Namespaced, because localStorage is one flat bucket shared with every script
  on the origin. `theme` on its own is the key three other things also picked.
*/
export const THEME_STORAGE_KEY = 'harkhr.theme'

export const DEFAULT_PREFERENCE: ThemePreference = 'system'

function isThemePreference(value: unknown): value is ThemePreference {
  return THEME_PREFERENCES.includes(value as ThemePreference)
}

/**
 * The stored preference, or `system` if there is nothing usable.
 *
 * Wrapped in try/catch because `localStorage` *throws* rather than returning
 * null in two ordinary situations: Safari's private mode, and any browser with
 * third-party storage blocked when the app is framed. A theme lookup must
 * never be the thing that white-screens the app.
 */
export function readStoredPreference(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    return isThemePreference(stored) ? stored : DEFAULT_PREFERENCE
  } catch {
    return DEFAULT_PREFERENCE
  }
}

export function writeStoredPreference(preference: ThemePreference): void {
  try {
    if (preference === DEFAULT_PREFERENCE) {
      // Storing "system" as a value would pin the app to whatever `system`
      // meant at write time if the default ever changes. Absence is the more
      // durable way to say "no opinion".
      window.localStorage.removeItem(THEME_STORAGE_KEY)
    } else {
      window.localStorage.setItem(THEME_STORAGE_KEY, preference)
    }
  } catch {
    // A user who cannot persist the choice should still get the choice for
    // this session. Failing silently is correct here.
  }
}

const DARK_QUERY = '(prefers-color-scheme: dark)'

/** What the OS is asking for right now. */
export function systemTheme(): ResolvedTheme {
  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light'
}

/*
  The OS preference as an external store, for `useSyncExternalStore`.

  A media query is exactly what that hook is for: state that lives outside
  React and changes without React's knowledge. The alternative — mirroring it
  into `useState` and writing it back from an effect — stores derived data and
  renders once with the stale value before correcting itself, which is both a
  cascading render and a visible flicker at sunset.
*/
export function subscribeToSystemTheme(onChange: () => void): () => void {
  const query = window.matchMedia(DARK_QUERY)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

/** The snapshot must be a primitive, or React re-renders on every check. */
export function getSystemThemeSnapshot(): ResolvedTheme {
  return systemTheme()
}

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  return preference === 'system' ? systemTheme() : preference
}

/**
 * Writes the preference onto `<html>`.
 *
 * The attribute is *removed* for `system` rather than set to "system", because
 * the CSS keys off `:root:not([data-theme="light"])` inside a
 * `prefers-color-scheme` query — no attribute means the media query decides,
 * which is exactly what "follow the OS" means. See the block at the top of
 * `index.css`.
 */
export function applyTheme(preference: ThemePreference): void {
  const root = document.documentElement

  if (preference === 'system') {
    root.removeAttribute('data-theme')
  } else {
    root.setAttribute('data-theme', preference)
  }
}

/**
 * The preference to store when somebody asks for `next`.
 *
 * The subtlety: if the theme they picked is already what their OS says, we
 * store `system` rather than pinning. That way a user whose laptop switches to
 * dark at sunset keeps following it, instead of being frozen in the light
 * theme because they once clicked the toggle twice. Pinning only happens when
 * the choice actually disagrees with the OS.
 */
export function preferenceFor(next: ResolvedTheme): ThemePreference {
  return systemTheme() === next ? 'system' : next
}
