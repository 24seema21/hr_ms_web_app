import type { OnboardingStage } from '../types'

/* DEMO DATA — replace with GET /api/v1/settings/onboarding-stages. */

export const ONBOARDING_STAGES: OnboardingStage[] = [
  {
    id: 'stage-documentation',
    name: 'Documentation',
    description: 'Statutory paperwork collected before day one where possible.',
    tasks: [
      {
        id: 'task-offer-signed',
        title: 'Signed offer letter received',
        ownerRole: 'HR',
        dueWithinDays: 0,
        mandatory: true,
      },
      {
        id: 'task-id-proof',
        title: 'Aadhaar and PAN uploaded',
        ownerRole: 'Employee',
        dueWithinDays: 2,
        mandatory: true,
      },
      {
        id: 'task-education',
        title: 'Education certificates verified',
        ownerRole: 'HR',
        dueWithinDays: 7,
        mandatory: true,
      },
      {
        id: 'task-prev-relieving',
        title: 'Relieving letter from previous employer',
        ownerRole: 'Employee',
        dueWithinDays: 14,
        mandatory: false,
      },
    ],
  },
  {
    id: 'stage-it-setup',
    name: 'IT Setup',
    description: 'Hardware, accounts and access provisioned for the first login.',
    tasks: [
      {
        id: 'task-laptop',
        title: 'Laptop allocated and imaged',
        ownerRole: 'IT',
        dueWithinDays: 1,
        mandatory: true,
      },
      {
        id: 'task-accounts',
        title: 'Email and SSO account created',
        ownerRole: 'IT',
        dueWithinDays: 1,
        mandatory: true,
      },
      {
        id: 'task-tooling',
        title: 'Access to team tooling granted',
        ownerRole: 'Manager',
        dueWithinDays: 3,
        mandatory: true,
      },
      {
        id: 'task-vpn',
        title: 'VPN profile installed',
        ownerRole: 'IT',
        dueWithinDays: 3,
        mandatory: false,
      },
    ],
  },
  {
    id: 'stage-hr-orientation',
    name: 'HR Orientation',
    description: 'Policy walkthrough, payroll enrolment and benefits selection.',
    tasks: [
      {
        id: 'task-induction',
        title: 'Induction session attended',
        ownerRole: 'HR',
        dueWithinDays: 3,
        mandatory: true,
      },
      {
        id: 'task-payroll',
        title: 'Bank details and PF nomination submitted',
        ownerRole: 'Finance',
        dueWithinDays: 5,
        mandatory: true,
      },
      {
        id: 'task-insurance',
        title: 'Group insurance dependants declared',
        ownerRole: 'Employee',
        dueWithinDays: 10,
        mandatory: false,
      },
      {
        id: 'task-policy-ack',
        title: 'Code of conduct acknowledged',
        ownerRole: 'Employee',
        dueWithinDays: 7,
        mandatory: true,
      },
    ],
  },
  {
    id: 'stage-team-integration',
    name: 'Team Integration',
    description: 'The first fortnight with the reporting manager and the team.',
    tasks: [
      {
        id: 'task-buddy',
        title: 'Onboarding buddy assigned',
        ownerRole: 'Manager',
        dueWithinDays: 2,
        mandatory: true,
      },
      {
        id: 'task-goals',
        title: 'First 30-day goals agreed',
        ownerRole: 'Manager',
        dueWithinDays: 10,
        mandatory: true,
      },
      {
        id: 'task-intro',
        title: 'Team introduction call held',
        ownerRole: 'Manager',
        dueWithinDays: 5,
        mandatory: false,
      },
    ],
  },
]
