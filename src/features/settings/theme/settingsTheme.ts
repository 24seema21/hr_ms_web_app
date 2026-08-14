import { createTheme } from '@mui/material/styles'
import type { Theme } from '@mui/material/styles'
import type { ResolvedTheme } from '@/shared/lib/theme'
import { FONT_MONO, FONT_SANS, SETTINGS_PALETTES } from './settingsTokens'

/**
 * Builds the MUI theme for the Settings module from the product's own tokens.
 *
 * The Settings module is the only part of the app rendered by MUI; every other
 * screen is Tailwind. This factory is what stops that showing — it re-points
 * MUI's palette, radii and type at the same values `index.css` uses, so a
 * Settings table sits next to the Employees table without looking borrowed.
 *
 * Call it through `useMemo` keyed on the mode: `createTheme` walks and freezes
 * the whole theme object, and rebuilding it every render re-renders every
 * styled component underneath it.
 */
export function createSettingsTheme(mode: ResolvedTheme): Theme {
  const c = SETTINGS_PALETTES[mode]

  return createTheme({
    palette: {
      mode,
      primary: {
        main: c.brand600,
        light: c.brand400,
        dark: c.brand700,
        contrastText: c.onBrand,
      },
      secondary: {
        main: c.accent400,
        contrastText: c.onAccent,
      },
      error: {
        main: c.danger600,
        light: c.danger100,
        dark: c.danger700,
        contrastText: c.onDanger,
      },
      success: {
        main: c.success600,
        light: c.success50,
      },
      background: {
        default: c.shell,
        paper: c.surface,
      },
      text: {
        primary: c.ink900,
        secondary: c.ink600,
        disabled: c.ink400,
      },
      divider: c.ink200,
      action: {
        hover: c.ink50,
        selected: c.brand50,
      },
    },

    shape: { borderRadius: 8 },

    typography: {
      fontFamily: FONT_SANS,
      fontWeightMedium: 500,
      h5: { fontWeight: 600, letterSpacing: '-0.015em' },
      h6: { fontWeight: 600, letterSpacing: '-0.01em' },
      subtitle2: { fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 500 },
      // The "column label" voice from index.css: mono, small, spaced, upper.
      overline: {
        fontFamily: FONT_MONO,
        fontSize: '0.6875rem',
        fontWeight: 500,
        letterSpacing: '0.1em',
        lineHeight: 1.6,
      },
      caption: { color: c.ink500 },
    },

    components: {
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: { backgroundImage: 'none' },
        },
      },

      MuiCard: {
        defaultProps: { elevation: 0, variant: 'outlined' },
        styleOverrides: {
          root: { borderColor: c.ink200, borderRadius: 12 },
        },
      },

      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { borderRadius: 8 },
          sizeSmall: { paddingInline: 12 },
        },
      },

      MuiTextField: {
        defaultProps: { size: 'small', fullWidth: true },
      },

      MuiSelect: {
        defaultProps: { size: 'small' },
      },

      MuiFormHelperText: {
        styleOverrides: {
          root: { marginLeft: 2 },
        },
      },

      MuiTableCell: {
        styleOverrides: {
          root: { borderColor: c.ink200 },
          head: {
            fontFamily: FONT_MONO,
            fontSize: '0.6875rem',
            fontWeight: 500,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: c.ink500,
            backgroundColor: c.ink50,
            whiteSpace: 'nowrap',
          },
        },
      },

      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: 12 },
        },
      },

      MuiDrawer: {
        styleOverrides: {
          paper: { backgroundImage: 'none' },
        },
      },

      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 500 },
          sizeSmall: { fontSize: '0.75rem' },
        },
      },

      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            '&.Mui-selected': {
              backgroundColor: c.brand50,
              color: c.brand700,
              '&:hover': { backgroundColor: c.brand100 },
            },
          },
        },
      },

      MuiTooltip: {
        defaultProps: { arrow: true },
      },

      // A focus ring that matches the one `index.css` sets globally, since
      // ScopedCssBaseline resets the outline inside the Settings subtree.
      MuiButtonBase: {
        styleOverrides: {
          root: {
            '&:focus-visible': {
              outline: `2px solid ${c.brand600}`,
              outlineOffset: 2,
            },
          },
        },
      },
    },
  })
}
