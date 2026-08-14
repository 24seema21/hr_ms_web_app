/**
 * The design tokens the Settings module hands to MUI.
 *
 * These are literal mirrors of the `@theme` block and dark palette in
 * `src/index.css`. They are duplicated as JS values rather than read as
 * `var(--color-…)` because MUI computes derived colours (`alpha()`, contrast
 * text, hover washes) at runtime, and those helpers cannot parse a CSS
 * variable reference — they need a real hex.
 *
 * Changing a colour therefore means changing it in both places. That is the
 * cost of running a second styling system alongside Tailwind.
 */

export interface SettingsPalette {
  brand50: string
  brand100: string
  brand400: string
  brand600: string
  brand700: string
  accent100: string
  accent400: string
  ink50: string
  ink100: string
  ink200: string
  ink300: string
  ink400: string
  ink500: string
  ink600: string
  ink900: string
  shell: string
  surface: string
  onBrand: string
  onAccent: string
  onDanger: string
  danger100: string
  danger600: string
  danger700: string
  success50: string
  success600: string
}

const light: SettingsPalette = {
  brand50: '#eef5f2',
  brand100: '#d8eae3',
  brand400: '#4f9982',
  brand600: '#146152',
  brand700: '#0f4e42',
  accent100: '#fae9c7',
  accent400: '#e9a33b',
  ink50: '#f6f7f5',
  ink100: '#edefec',
  ink200: '#dfe2de',
  ink300: '#c4c9c4',
  ink400: '#9ba29c',
  ink500: '#767d77',
  ink600: '#5a615c',
  ink900: '#1a1f1d',
  shell: '#f4f5f1',
  surface: '#ffffff',
  onBrand: '#ffffff',
  onAccent: '#0d110f',
  onDanger: '#ffffff',
  danger100: '#f9e2dc',
  danger600: '#b4442f',
  danger700: '#93341f',
  success50: '#f0f6ec',
  success600: '#3f7d3a',
}

const dark: SettingsPalette = {
  brand50: '#0f2320',
  brand100: '#14312b',
  brand400: '#357864',
  brand600: '#63b89d',
  brand700: '#82cbb2',
  accent100: '#3a2a0c',
  accent400: '#e9a33b',
  ink50: '#1f2523',
  ink100: '#262d2a',
  ink200: '#313936',
  ink300: '#3e4744',
  ink400: '#767f7a',
  ink500: '#8f9893',
  ink600: '#a9b1ac',
  ink900: '#eef2ef',
  shell: '#121715',
  surface: '#1b211e',
  onBrand: '#07211b',
  onAccent: '#0d110f',
  onDanger: '#2a0f09',
  danger100: '#3a1c17',
  danger600: '#e2705a',
  danger700: '#ef927e',
  success50: '#16220f',
  success600: '#7bbf6f',
}

export const SETTINGS_PALETTES = { light, dark } as const

export const FONT_SANS =
  '"Archivo", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'

export const FONT_MONO =
  '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'

/** The swatches offered when tagging a leave type. */
export const LEAVE_COLOR_SWATCHES = [
  '#2a7c65',
  '#d6871f',
  '#b4442f',
  '#767d77',
  '#4f9982',
  '#8c5113',
  '#146152',
  '#3f7d3a',
] as const
