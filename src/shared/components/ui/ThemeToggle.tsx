import { useTheme } from '@/shared/hooks/useTheme'
import { cn } from '@/shared/lib/cn'
import { MoonIcon, SunIcon } from './icons'

interface ThemeToggleProps {
  className?: string
}

/**
 * Switches the product between light and dark.
 *
 * Shows the theme you would *get*, not the one you are in — a sun while it is
 * dark, a moon while it is light. Both readings are common and neither is
 * self-evident from a glyph, which is why the accessible name and the tooltip
 * both spell out the action ("Switch to dark theme") rather than naming a
 * state. The icon is the shorthand; the words are the answer.
 *
 * `aria-pressed` is deliberately *not* used. This is not a control that is on
 * or off — it swaps between two equally valid states, and a toggle button
 * announced as "pressed" invites the question "pressed into which one?".
 *
 * Not built on `IconButton` because it needs the two-glyph crossfade below,
 * which that component has no way to express.
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()

  const isDark = theme === 'dark'
  const label = isDark ? 'Switch to light theme' : 'Switch to dark theme'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={cn(
        'relative inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center',
        'rounded-control text-ink-500 transition-colors duration-150',
        'hover:bg-ink-100 hover:text-ink-900',
        className,
      )}
    >
      {/*
        Both glyphs are always rendered, stacked, and crossfaded — swapping one
        for the other on click makes the button flicker as the new icon's font
        metrics settle. Rotating them in opposite directions is what makes it
        read as one object turning over rather than two images swapping.

        `motion-reduce:` drops the movement for anybody who has asked their OS
        for less of it; the opacity change stays, so the button still shows
        which state it is in.
      */}
      <SunIcon
        className={cn(
          'absolute h-5 w-5 transition-all duration-300 ease-out-quart',
          'motion-reduce:transition-opacity motion-reduce:duration-0',
          isDark
            ? 'scale-100 rotate-0 opacity-100'
            : 'scale-50 -rotate-90 opacity-0',
        )}
      />
      <MoonIcon
        className={cn(
          'absolute h-5 w-5 transition-all duration-300 ease-out-quart',
          'motion-reduce:transition-opacity motion-reduce:duration-0',
          isDark
            ? 'scale-50 rotate-90 opacity-0'
            : 'scale-100 rotate-0 opacity-100',
        )}
      />
    </button>
  )
}
