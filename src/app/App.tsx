import { Suspense } from 'react'
import { RouterProvider } from 'react-router'
import { AuthProvider } from '@/features/auth/context/AuthProvider'
import { ThemeProvider } from '@/shared/context/ThemeProvider'
import { Spinner } from '@/shared/components/ui/Spinner'
import { router } from './routes'

/** Shown while a lazily-loaded page chunk is being fetched. */
function PageFallback() {
  return (
    <div
      className="flex min-h-dvh items-center justify-center"
      // Announces the wait to a screen reader, which otherwise gets silence.
      role="status"
      aria-live="polite"
    >
      <Spinner className="h-6 w-6 text-brand-600" />
      <span className="sr-only">Loading…</span>
    </div>
  )
}

/**
 * App-wide wiring, and nothing else. No markup, no business logic — those
 * belong to the features.
 *
 * Order matters: AuthProvider is *outside* RouterProvider, so auth state is
 * available to every route (and survives navigation between them). Flip the
 * two and the provider would remount on each navigation, logging the user out
 * every time they clicked a link.
 */
export function App() {
  return (
    /*
      ThemeProvider outermost: the theme applies to the public pages, the login
      screen and the signed-in shell alike, and it must survive both navigation
      and signing out. Nesting it inside AuthProvider would also work today,
      but it would tie the appearance of the app to the lifetime of a session —
      and logging out should not put somebody back into the light theme.
    */
    <ThemeProvider>
      <AuthProvider>
        {/*
          One Suspense boundary for the whole router. React pauses rendering
          while a lazy page chunk downloads, and shows this fallback meanwhile
          instead of a blank screen.
        */}
        <Suspense fallback={<PageFallback />}>
          <RouterProvider router={router} />
        </Suspense>
      </AuthProvider>
    </ThemeProvider>
  )
}
