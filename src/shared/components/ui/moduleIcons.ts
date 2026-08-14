import {
  CalendarIcon,
  ChartIcon,
  ChecklistIcon,
  ClockIcon,
  LaptopIcon,
  LogOutIcon,
  SlidersIcon,
  TargetIcon,
  TicketIcon,
  UsersIcon,
  WalletIcon,
} from './icons'

/**
 * The glyph for each Unity Portal module, looked up by the module's id.
 *
 * This lives beside `icons.tsx` rather than inside it for a mechanical reason:
 * Vite's fast refresh only preserves state in a module whose exports are *all*
 * components, and `eslint-plugin-react-refresh` enforces it. One exported
 * lookup table in that file would cost every icon its hot reload.
 *
 * The map exists at all so that `landing/data/features.ts` stays plain data —
 * no JSX, no component imports — while the compiler still checks that every
 * module has a glyph, because `Feature.id` is typed as `ModuleIconName`.
 *
 * The order below is the employee lifecycle, not the alphabet: onboarding
 * first, offboarding last, and the things that happen in between in between.
 */
export const MODULE_ICONS = {
  onboarding: ChecklistIcon,
  directory: UsersIcon,
  attendance: ClockIcon,
  leave: CalendarIcon,
  assets: LaptopIcon,
  tickets: TicketIcon,
  goals: TargetIcon,
  config: SlidersIcon,
  reports: ChartIcon,
  offboarding: LogOutIcon,
  payroll: WalletIcon,
} as const

export type ModuleIconName = keyof typeof MODULE_ICONS
