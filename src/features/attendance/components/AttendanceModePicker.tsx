import { useId } from 'react'
import { BuildingIcon, HomeIcon } from '@/shared/components/ui/icons'
import { cn } from '@/shared/lib/cn'
import { ATTENDANCE_MODES } from '../types'
import type { AttendanceMode } from '../types'

const MODE_META = {
  office: { label: 'Office', Icon: BuildingIcon },
  remote: { label: 'Remote', Icon: HomeIcon },
} as const

interface AttendanceModePickerProps {
  value: AttendanceMode
  onChange: (mode: AttendanceMode) => void
  /** Locked once a session is running — the mode belongs to that session. */
  disabled?: boolean
  className?: string
}

/**
 * Office or Remote, chosen before checking in.
 *
 * Built from real radio inputs rather than two buttons with an `aria-pressed`
 * apiece. A radio group is what this is — one of two, exactly one selected —
 * and the browser then gives arrow-key navigation, the correct "2 of 2"
 * announcement and form semantics for free.
 *
 * Deliberately not derived from geolocation. Asking for coordinates on page
 * load is a permission prompt nobody expected, for a fact the employee can
 * state in one tap. When an org turns on geofencing the request is made *on
 * the check-in click*, with a sentence explaining why, and a denial never
 * blocks the check-in — it records `location_verified: false` and lets the
 * manager see that.
 */
export function AttendanceModePicker({
  value,
  onChange,
  disabled = false,
  className,
}: AttendanceModePickerProps) {
  // One group name per instance, so two pickers on a page cannot capture each
  // other's clicks.
  const groupName = useId()

  return (
    <fieldset
      className={cn('min-w-0', disabled && 'opacity-60', className)}
      disabled={disabled}
    >
      <legend className="sr-only">Attendance mode</legend>

      <div className="inline-flex rounded-control border border-ink-300 bg-ink-50 p-0.5">
        {ATTENDANCE_MODES.map((mode) => {
          const { label, Icon } = MODE_META[mode]
          const isSelected = value === mode

          return (
            /*
              The input is visually hidden but still the thing that receives
              focus and the click; the styling hangs off `peer-checked` and
              `peer-focus-visible` on the label. `sr-only` rather than
              `display:none` — a hidden input is not focusable, which would
              take the whole control away from the keyboard.
            */
            <label
              key={mode}
              className={cn(
                'relative flex cursor-pointer items-center gap-1.5 rounded-[0.375rem] px-2.5 py-1 text-xs font-medium transition-colors',
                isSelected
                  ? 'bg-white text-ink-900 shadow-card'
                  : 'text-ink-500 hover:text-ink-800',
                disabled && 'cursor-not-allowed',
              )}
            >
              <input
                type="radio"
                name={groupName}
                value={mode}
                checked={isSelected}
                onChange={() => onChange(mode)}
                className="peer sr-only"
              />
              <Icon className="h-3.5 w-3.5" />
              {label}
              {/* The focus ring has to be drawn here: the input it belongs to
                  is off-screen, so the browser's own ring is invisible. */}
              <span className="pointer-events-none absolute inset-0 rounded-[0.375rem] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-600" />
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
