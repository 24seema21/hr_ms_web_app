import { z } from 'zod'

/*
  One schema, two jobs: it validates at runtime AND produces the TypeScript
  type below. That is the reason to use Zod rather than hand-written `if`
  statements plus a separate `interface`.

  With two hand-maintained definitions, adding a field means editing both —
  and the day you forget, the types say one thing and the validation says
  another, with no error to tell you. Here it is impossible: the type is
  *derived*, so they cannot drift.
*/
export const loginSchema = z.object({
  email: z
    .string()
    // `.trim()` transforms the value, so a pasted " hr@demo.com " is cleaned
    // before it is checked — and the cleaned value is what reaches `login()`.
    .trim()
    // Checks run in order, so an empty field says "required" rather than the
    // less helpful "enter a valid email address".
    .min(1, 'Email is required')
    .pipe(z.email('Enter a valid email address')),

  /*
    "Required" is the only rule a *sign-in* password gets.

    A minimum length belongs on the sign-up form, where it shapes the password
    being created. Here the password already exists, and the only authority on
    whether it is correct is the bcrypt comparison in the backend. A client-side
    `min(8)` cannot make a wrong password right — but it can lock out a real
    account whose password predates the rule, and it tells an attacker the
    shape of what they are guessing before they spend a single request.
  */
  password: z.string().min(1, 'Password is required'),

  rememberMe: z.boolean(),
})

/**
 * The form's value type, inferred from the schema above.
 *
 * `{ email: string; password: string; rememberMe: boolean }` — written once,
 * in the schema, and never by hand.
 */
export type LoginFormValues = z.infer<typeof loginSchema>
