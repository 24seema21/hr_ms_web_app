import { lazy } from 'react'
import type { ComponentType, LazyExoticComponent } from 'react'
import type { SvgIconComponent } from '@mui/icons-material'
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined'
import ChecklistRtlIcon from '@mui/icons-material/ChecklistRtl'
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined'
import HourglassTopOutlinedIcon from '@mui/icons-material/HourglassTopOutlined'
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined'
import type { SettingsSectionId } from '../types'

/**
 * What a section receives. Only the leave-type screen uses `onNavigate` today
 * (it cross-references probation), but every section is typed for it so the
 * registry can hold them in one array without a cast.
 */
export interface SettingsSectionProps {
  onNavigate: (section: SettingsSectionId) => void
}

export interface SettingsSectionMeta {
  id: SettingsSectionId
  label: string
  summary: string
  Icon: SvgIconComponent
  Component: LazyExoticComponent<ComponentType<SettingsSectionProps>>
}

/*
  Each section is its own chunk. Only one is on screen at a time, so bundling
  all five — five tables, four dialogs and a permissions matrix — into the
  Settings entry point would make opening Onboarding pay for Roles.

  The `.then(...)` shape is the codebase's convention for `lazy()` over a named
  export; see `app/lazyPages.ts` for why named exports are used everywhere.
*/
export const SETTINGS_SECTIONS: SettingsSectionMeta[] = [
  {
    id: 'onboarding',
    label: 'Onboarding',
    summary: 'Stages and tasks for new joiners',
    Icon: ChecklistRtlIcon,
    Component: lazy(() =>
      import('./onboarding/OnboardingConfig').then((m) => ({
        default: m.OnboardingConfig,
      })),
    ),
  },
  {
    id: 'locations',
    label: 'Locations',
    summary: 'Offices, timezones and working weeks',
    Icon: PlaceOutlinedIcon,
    Component: lazy(() =>
      import('./locations/LocationConfig').then((m) => ({
        default: m.LocationConfig,
      })),
    ),
  },
  {
    id: 'leave-types',
    label: 'Leave Types',
    summary: 'Entitlements and carry-forward rules',
    Icon: EventAvailableOutlinedIcon,
    Component: lazy(() =>
      import('./leaveTypes/LeaveTypeConfig').then((m) => ({
        default: m.LeaveTypeConfig,
      })),
    ),
  },
  {
    id: 'probation',
    label: 'Probation',
    summary: 'Duration, reviews and leave overrides',
    Icon: HourglassTopOutlinedIcon,
    Component: lazy(() =>
      import('./probation/ProbationConfig').then((m) => ({
        default: m.ProbationConfig,
      })),
    ),
  },
  {
    id: 'roles',
    label: 'User Roles',
    summary: 'Roles and the permissions matrix',
    Icon: AdminPanelSettingsOutlinedIcon,
    Component: lazy(() =>
      import('./roles/UserRoleConfig').then((m) => ({
        default: m.UserRoleConfig,
      })),
    ),
  },
]

export const DEFAULT_SECTION_ID: SettingsSectionId = 'onboarding'

/** Guards the `?section=` query parameter, which anyone can type anything into. */
export function isSettingsSectionId(
  value: string | null,
): value is SettingsSectionId {
  return SETTINGS_SECTIONS.some((section) => section.id === value)
}
