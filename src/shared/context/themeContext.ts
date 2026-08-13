import { createContext } from 'react'
import type { ResolvedTheme, ThemePreference } from '@/shared/lib/theme'

export interface ThemeContextValue {
  /** What the user asked for, including `system`. */
  preference: ThemePreference
  /** What that resolves to right now — never `system`. */
  theme: ResolvedTheme
  setPreference: (preference: ThemePreference) => void
  /** Flips between light and dark, relinking to the OS where it can. */
  toggleTheme: () => void
}

/*
  In its own module, exporting no components, for the same reason
  `authContext.ts` is: Vite's fast refresh only preserves state in a file whose
  exports are *all* components, and `eslint-plugin-react-refresh` enforces it.
  A context object living beside its provider costs that provider its hot
  reload — and a provider that remounts on every edit is a provider that resets
  the theme while you are looking at it.

  `undefined` as the default is deliberate: it is what lets `useTheme` tell
  "no provider above me" apart from a legitimately light theme, and throw
  instead of silently rendering the wrong one.
*/
export const ThemeContext = createContext<ThemeContextValue | undefined>(
  undefined,
)
