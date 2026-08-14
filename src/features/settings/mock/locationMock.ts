import type { OfficeLocation } from '../types'

/* DEMO DATA — replace with GET /api/v1/settings/locations. */

export const TIMEZONES = [
  'Asia/Kolkata',
  'Asia/Dubai',
  'Asia/Singapore',
  'Europe/London',
  'Europe/Berlin',
  'America/New_York',
  'America/Los_Angeles',
  'Australia/Sydney',
] as const

export const COUNTRIES = [
  'India',
  'United Arab Emirates',
  'Singapore',
  'United Kingdom',
  'Germany',
  'United States',
  'Australia',
] as const

const WEEKDAYS_MON_FRI = ['mon', 'tue', 'wed', 'thu', 'fri'] as const

export const OFFICE_LOCATIONS: OfficeLocation[] = [
  {
    id: 'loc-pune-hq',
    name: 'Pune HQ',
    addressLine: 'Level 7, Amar Tech Park, Balewadi High Street',
    city: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    timezone: 'Asia/Kolkata',
    workingDays: [...WEEKDAYS_MON_FRI],
    status: 'active',
  },
  {
    id: 'loc-bengaluru',
    name: 'Bengaluru Engineering',
    addressLine: '2nd Floor, Prestige Tech Platina, Marathahalli',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    timezone: 'Asia/Kolkata',
    workingDays: [...WEEKDAYS_MON_FRI],
    status: 'active',
  },
  {
    id: 'loc-mumbai-sales',
    name: 'Mumbai Sales',
    addressLine: 'Unit 305, Peninsula Business Park, Lower Parel',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    timezone: 'Asia/Kolkata',
    workingDays: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
    status: 'active',
  },
  {
    id: 'loc-dubai',
    name: 'Dubai Regional',
    addressLine: 'Office 1204, One Central, DWTC',
    city: 'Dubai',
    state: 'Dubai',
    country: 'United Arab Emirates',
    timezone: 'Asia/Dubai',
    // The Gulf working week runs Monday to Friday with a Friday half day.
    workingDays: [...WEEKDAYS_MON_FRI],
    status: 'active',
  },
  {
    id: 'loc-london',
    name: 'London Client Office',
    addressLine: '14 Finsbury Square',
    city: 'London',
    state: 'Greater London',
    country: 'United Kingdom',
    timezone: 'Europe/London',
    workingDays: [...WEEKDAYS_MON_FRI],
    status: 'active',
  },
  {
    id: 'loc-hyderabad',
    name: 'Hyderabad Satellite',
    addressLine: 'Wing B, Q City, Gachibowli',
    city: 'Hyderabad',
    state: 'Telangana',
    country: 'India',
    timezone: 'Asia/Kolkata',
    workingDays: [...WEEKDAYS_MON_FRI],
    status: 'inactive',
  },
]
