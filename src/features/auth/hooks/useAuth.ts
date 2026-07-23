import { useContext } from 'react'
import { AuthContext } from '../context/authContext'
import type { AuthContextValue } from '../context/authContext'

/**
 * The only supported way to read auth state.
 *
 * Components import this, never `AuthContext` directly. That indirection is
 * what lets the state implementation change later (Zustand, TanStack Query, a
 * reducer) without touching a single consumer.
 *
 * The throw is the important part. If the context is missing, the alternative
 * is `user` being silently `undefined`, and you debug a crash three components
 * away from the actual mistake. Failing loudly, at the exact call site, with
 * the fix in the message, turns a 20-minute hunt into a 5-second read.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (context === null) {
    throw new Error(
      'useAuth() was called outside of <AuthProvider>. ' +
        'Wrap the component tree (usually in main.tsx) in <AuthProvider>.',
    )
  }

  return context
}
