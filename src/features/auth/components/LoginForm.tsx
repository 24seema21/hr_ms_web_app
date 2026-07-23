import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router'
import { Button } from '@/shared/components/ui/Button'
import { TextField } from '@/shared/components/ui/TextField'
import { ROUTES } from '@/shared/constants/routes'
import { useAuth } from '../hooks/useAuth'
import { loginSchema } from '../schemas/loginSchema'
import type { LoginFormValues } from '../schemas/loginSchema'

export function LoginForm() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    // The bridge between Zod and React Hook Form: RHF calls the schema and
    // turns each issue into `errors.<fieldName>`.
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
    /*
      Validate when a field loses focus, not on every keystroke.
      `onChange` mode shouts "Enter a valid email address" at someone who has
      typed two characters and is not finished yet. `onBlur` waits until they
      have moved on — which is the moment the answer is actually meaningful.
      (After the first failed submit RHF re-validates on change automatically,
      so corrections still clear the error immediately.)
    */
    mode: 'onBlur',
  })

  /*
    `handleSubmit` runs validation first and only calls this if it passes —
    so `values` is already the correct shape here, no re-checking needed.
  */
  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login(values)
      /*
        `replace: true` swaps the history entry instead of adding one, so
        pressing Back from the dashboard does not return to the login page of
        a session you are already inside.
      */
      await navigate(ROUTES.DASHBOARD, { replace: true })
    } catch {
      /*
        `root` is RHF's slot for an error that belongs to the whole form
        rather than to one field. "Wrong password" is not really about the
        password input alone — it is about the combination — so attaching it
        to a single field would be misleading.

        Note what we do NOT do: clear the fields. Wiping a password on a failed
        attempt is a classic hostile touch. Retyping is punishment for a typo.
      */
      setError('root', {
        message: 'That email and password combination is not recognised.',
      })
    }
  }

  return (
    /*
      `noValidate` turns off the browser's own bubble messages so ours are the
      only ones shown — consistent wording, consistent styling, and they stay
      on screen instead of vanishing after a few seconds. The inputs keep
      `type="email"` regardless, because that is what gives phones the right
      keyboard.
    */
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {errors.root && (
        /*
          `role="alert"` makes a screen reader announce this the instant it
          appears. Without it, a blind user submits, hears nothing, and has no
          idea the attempt failed.
        */
        <div
          role="alert"
          className="rounded-control border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700"
        >
          {errors.root.message}
        </div>
      )}

      <TextField
        label="Work email"
        type="email"
        autoComplete="email"
        placeholder="you@company.com"
        // `autoFocus` is safe here: this form is the entire purpose of the
        // page, so focus is already where the user wants it.
        autoFocus
        error={errors.email?.message}
        /*
          `register` returns { name, onChange, onBlur, ref } and we spread it
          onto the input. The `ref` is the whole trick behind React Hook Form:
          it reads values straight from the DOM node instead of holding them in
          React state, so typing does not re-render the form on every keystroke.
        */
        {...register('email')}
      />

      <TextField
        label="Password"
        type="password"
        // Tells a password manager this is a sign-in field, not a new password.
        autoComplete="current-password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...register('password')}
      />

      <div className="flex items-center justify-between gap-4">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-700">
          {/*
            The checkbox is *inside* its <label>, so the whole "Remember me"
            text is a click target — no id/htmlFor pairing needed.
          */}
          <input
            type="checkbox"
            className="h-4 w-4 cursor-pointer rounded border-ink-300 text-brand-600 accent-brand-600"
            {...register('rememberMe')}
          />
          Remember me
        </label>

        {/*
          Phase 2 will make this real. It is a <button> rather than a dead
          <a href="#">, because a link that navigates nowhere is a trap for
          keyboard and screen-reader users.
        */}
        <button
          type="button"
          className="cursor-pointer text-sm font-medium text-brand-700 hover:text-brand-800"
          onClick={() =>
            window.alert('Password recovery arrives in a later phase.')
          }
        >
          Forgot password?
        </button>
      </div>

      {/*
        `type="submit"` matters: it is what makes pressing Enter in a text
        field submit the form, which is how people actually fill in logins.

        The button is disabled only while a request is genuinely in flight —
        never because the form is invalid. Disabling on invalid gives the user
        a dead button and no explanation of why.
      */}
      <Button type="submit" size="lg" isLoading={isSubmitting} className="w-full">
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  )
}
