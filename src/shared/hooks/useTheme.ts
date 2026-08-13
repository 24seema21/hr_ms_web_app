import { useContext } from 'react'
import { ThemeContext } from '@/shared/context/themeContext'
import type { ThemeContextValue } from '@/shared/context/themeContext'

/**
 * The current theme and the ways to change it.
 *
 * Throws when there is no `ThemeProvider` above, rather than returning a
 * default. A silent fallback here would mean a toggle that renders, responds
 * to clicks and changes nothing — the most expensive kind of bug to find,
 * because it looks like it works.
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)

  if (context === undefined) {
    throw new Error('useTheme must be used inside a <ThemeProvider>')
  }

  return context
}
