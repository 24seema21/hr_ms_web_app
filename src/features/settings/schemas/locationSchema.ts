import { z } from 'zod'
import type { OfficeLocation } from '../types'

export const locationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Location name is required')
    .max(80, 'Location name must be 80 characters or fewer'),

  addressLine: z
    .string()
    .trim()
    .min(1, 'Address is required')
    .max(200, 'Address must be 200 characters or fewer'),

  city: z
    .string()
    .trim()
    .min(1, 'City is required')
    .max(80, 'City must be 80 characters or fewer'),

  state: z
    .string()
    .trim()
    .min(1, 'State or region is required')
    .max(80, 'State must be 80 characters or fewer'),

  country: z.string().trim().min(1, 'Select a country'),

  timezone: z.string().trim().min(1, 'Select a timezone'),

  // A location nobody ever works at would break every attendance calculation
  // that divides by the working-day count.
  workingDays: z
    .array(z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']))
    .min(1, 'Select at least one working day'),

  status: z.enum(['active', 'inactive']),
})

export type LocationFormValues = z.infer<typeof locationSchema>

export const EMPTY_LOCATION_FORM: LocationFormValues = {
  name: '',
  addressLine: '',
  city: '',
  state: '',
  country: '',
  timezone: '',
  workingDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
  status: 'active',
}

export function toLocationFormValues(
  location: OfficeLocation,
): LocationFormValues {
  return {
    name: location.name,
    addressLine: location.addressLine,
    city: location.city,
    state: location.state,
    country: location.country,
    timezone: location.timezone,
    workingDays: [...location.workingDays],
    status: location.status,
  }
}
