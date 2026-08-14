import { useContext } from 'react'
import { FeedbackContext } from '../context/feedbackContext'
import type { FeedbackValue } from '../context/feedbackContext'

/**
 * Confirmation and error messaging for the Settings sections.
 *
 * Throws when there is no provider above, rather than falling back to a no-op:
 * a save handler that reports success into the void looks like it works.
 */
export function useFeedback(): FeedbackValue {
  const context = useContext(FeedbackContext)

  if (context === null) {
    throw new Error('useFeedback must be used inside a <FeedbackProvider>')
  }

  return context
}
