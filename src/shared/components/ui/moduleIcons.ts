import {
  CalendarIcon,
  ChartIcon,
  ClockIcon,
  StarIcon,
  UsersIcon,
  WalletIcon,
} from './icons'

/**
 * The glyph for each HRMS module, looked up by the module's id.
 *
 * This lives beside `icons.tsx` rather than inside it for a mechanical reason:
 * Vite's fast refresh only preserves state in a module whose exports are *all*
 * components, and `eslint-plugin-react-refresh` enforces it. One exported
 * lookup table in that file would cost every icon its hot reload.
 *
 * The map exists at all so that `landing/data/features.ts` stays plain data —
 * no JSX, no component imports — while the compiler still checks that every
 * module has a glyph, because `Feature.id` is typed as `ModuleIconName`.
 */
export const MODULE_ICONS = {
  directory: UsersIcon,
  attendance: ClockIcon,
  leave: CalendarIcon,
  payroll: WalletIcon,
  performance: StarIcon,
  reports: ChartIcon,
} as const

export type ModuleIconName = keyof typeof MODULE_ICONS
