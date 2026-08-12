import type { ReactNode } from 'react'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { Drawer } from '@/shared/components/ui/Drawer'
import {
  MailIcon,
  MapPinIcon,
  PencilIcon,
  PhoneIcon,
  TrashIcon,
} from '@/shared/components/ui/icons'
import { fullNameOf, initialsOf } from '../lib/employeeName'
import type { Employee } from '../types'

interface EmployeeDetailDrawerProps {
  employee: Employee
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
}

/**
 * The whole record, read-only, beside the list.
 *
 * The table shows five columns because five is what fits; an employee has
 * eleven fields. This is where the other six live — and being read-only is the
 * feature, not a limitation. Opening the edit form to check somebody's address
 * means every lookup is one stray keystroke away from changing data.
 */
export function EmployeeDetailDrawer({
  employee,
  onClose,
  onEdit,
  onDelete,
}: EmployeeDetailDrawerProps) {
  const fullName = fullNameOf(employee)

  /* Blank lines dropped rather than rendered empty: an address with a hole in
     the middle looks like a rendering bug. */
  const addressLines = [
    employee.addressLine1,
    employee.addressLine2,
    [employee.city, employee.state].filter(Boolean).join(', '),
    employee.country,
  ].filter((line) => line.trim() !== '')

  return (
    <Drawer
      onClose={onClose}
      eyebrow={`Employee #${employee.id}`}
      title={fullName}
      footer={
        <div className="flex gap-3">
          {/*
            Both actions live here rather than in the body: a footer is where
            people look for what a panel lets them *do*, and it keeps them
            below the content they are meant to read first.
          */}
          <Button variant="secondary" className="flex-1" onClick={onEdit}>
            <PencilIcon className="h-4 w-4" />
            Edit details
          </Button>
          <Button variant="ghost" onClick={onDelete} className="text-danger-600 hover:bg-danger-50">
            <TrashIcon className="h-4 w-4" />
            Delete
          </Button>
        </div>
      }
    >
      {/*
        The name is *not* repeated here — it is already the panel's title two
        centimetres above, and printing it twice is the kind of duplication
        that makes a layout feel unconsidered. This block carries what the
        title cannot: the identity tile, the record's status, and the one
        attribute that has nowhere else to go.
      */}
      <div className="flex items-center gap-4">
        <span
          className="type-label flex h-14 w-14 shrink-0 items-center justify-center rounded-card bg-brand-900 text-base text-accent-300"
          aria-hidden="true"
        >
          {initialsOf(employee)}
        </span>
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {employee.gender && <Badge>{employee.gender}</Badge>}
          <Badge tone="success">Active</Badge>
        </div>
      </div>

      <dl className="mt-8 space-y-6">
        {/*
          `<dl>` because each value is genuinely *described by* its label, and
          a screen reader announces the pairing instead of reading eight
          unrelated lines of text.
        */}
        <Field label="Work email" icon={<MailIcon className="h-4 w-4" />}>
          {/*
            A real `mailto:` link. The address is on screen either way — making
            it actionable costs nothing and saves a copy-paste every time
            somebody uses this panel for what it is for.
          */}
          <a
            href={`mailto:${employee.email}`}
            className="break-all text-brand-700 hover:underline"
          >
            {employee.email}
          </a>
        </Field>

        <Field label="Phone" icon={<PhoneIcon className="h-4 w-4" />}>
          {employee.phone ? (
            <a
              href={`tel:${employee.phone}`}
              className="font-mono text-brand-700 hover:underline"
            >
              {employee.phone}
            </a>
          ) : (
            <Unset />
          )}
        </Field>

        <Field label="Address" icon={<MapPinIcon className="h-4 w-4" />}>
          {addressLines.length > 0 ? (
            /*
              A real `<address>` element, and the lines kept as separate lines.
              Joining an address with commas is how "Flat 4B, Orchid Residency"
              ends up on one unreadable line with the country.
            */
            <address className="not-italic">
              {addressLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
          ) : (
            <Unset />
          )}
        </Field>
      </dl>

      <p className="mt-8 border-t border-ink-200 pt-4 font-mono text-xs text-ink-400">
        Deleting deactivates this record; history is kept.
      </p>
    </Drawer>
  )
}

/**
 * One term/description pair.
 *
 * The wrapper is a `<div>` holding a `<dt>` and a `<dd>` and nothing else,
 * which is the only grouping element `<dl>` allows. Nesting them any deeper —
 * inside a flex row with the icon as a sibling, say — is invalid and quietly
 * breaks the term-to-description association some screen readers rely on. The
 * icon goes *inside* the term instead, which is also where it belongs
 * semantically: it labels the label.
 */
function Field({
  label,
  icon,
  children,
}: {
  label: string
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <div>
      <dt className="type-label flex items-center gap-2 text-ink-400">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-control bg-ink-50 text-ink-500"
          aria-hidden="true"
        >
          {icon}
        </span>
        {label}
      </dt>
      <dd className="mt-1.5 pl-9 text-sm text-ink-800">{children}</dd>
    </div>
  )
}

function Unset() {
  return <span className="text-ink-400">Not recorded</span>
}
