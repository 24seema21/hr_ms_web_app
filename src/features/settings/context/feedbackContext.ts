import { createContext } from 'react'

export type FeedbackSeverity = 'success' | 'error' | 'info'

export interface FeedbackValue {
  notify: (message: string, severity?: FeedbackSeverity) => void
}

/**
 * `null` rather than a no-op default, so `useFeedback` can tell "outside the
 * provider" from "inside it" and throw instead of silently swallowing every
 * confirmation message.
 */
export const FeedbackContext = createContext<FeedbackValue | null>(null)
