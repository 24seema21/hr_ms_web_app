import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react'
import type { ReactNode } from 'react'
import {
  applyTheme,
  getSystemThemeSnapshot,
  preferenceFor,
  readStoredPreference,
  subscribeToSystemTheme,
  writeStoredPreference,
} from '@/shared/lib/theme'
import type { ThemePreference } from '@/shared/lib/theme'
import { ThemeContext } from './themeContext'

/**
 * Owns the theme preference and keeps `<html>` in step with it.
 *
 * Mounted above the router in `App.tsx`, so the public pages and the signed-in
 * shell share one source of truth — a second copy would let the landing page
 * and the dashboard disagree across a navigation.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  /*
    Read from storage in the initialiser, not in an effect.

    An effect would render one frame with the default theme before correcting
    itself, which is the flash the boot script in index.html exists to prevent
    — reintroducing it here would defeat that entirely. The lazy initialiser
    runs once, before the first paint.
  */
  const [preference, setPreferenceState] = useState<ThemePreference>(
    readStoredPreference,
  )

  /*
    The OS preference, subscribed rather than copied.

    `useSyncExternalStore` keeps this in step with the media query without
    mirroring it into state — which matters beyond tidiness: "system" has to
    mean *currently*, not "whatever the OS said when this tab opened", or
    somebody whose machine turns dark at sunset sits in the light theme until
    they reload.

    Subscribed unconditionally, even while the preference is pinned, because
    `preferenceFor` consults it on every toggle to decide whether to re-link to
    the OS. One media-query listener is not worth conditionalising.
  */
  const systemTheme = useSyncExternalStore(
    subscribeToSystemTheme,
    getSystemThemeSnapshot,
    // Server snapshot: there is no OS preference to read while prerendering,
    // and light is this product's documented default.
    () => 'light' as const,
  )

  /*
    Derived during render, not stored.

    Holding `resolved` in state would mean writing it back from an effect on
    every preference change — a cascading render, and one frame of the old
    theme each time.
  */
  const resolved = preference === 'system' ? systemTheme : preference

  /*
    The one legitimate effect here: pushing state *out* to an external system,
    which is the document element. Everything else above is either derived or
    subscribed.
  */
  useEffect(() => {
    applyTheme(preference)
  }, [preference])

  /*
    Keep other tabs in step.

    `storage` fires in every *other* tab on the origin, so changing the theme
    in one propagates to the rest. Two tabs of the same app in different
    themes is the kind of small incoherence people notice and cannot explain.
  */
  useEffect(() => {
    const sync = () => setPreferenceState(readStoredPreference())

    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])

  const setPreference = useCallback((next: ThemePreference) => {
    writeStoredPreference(next)
    setPreferenceState(next)
  }, [])

  const toggleTheme = useCallback(() => {
    // `preferenceFor` stores `system` when the chosen theme already matches the
    // OS, so toggling back to your machine's setting re-links to it rather
    // than pinning you one click away from it forever.
    setPreference(preferenceFor(resolved === 'dark' ? 'light' : 'dark'))
  }, [resolved, setPreference])

  const value = useMemo(
    () => ({ preference, theme: resolved, setPreference, toggleTheme }),
    [preference, resolved, setPreference, toggleTheme],
  )

  return <ThemeContext value={value}>{children}</ThemeContext>
}
