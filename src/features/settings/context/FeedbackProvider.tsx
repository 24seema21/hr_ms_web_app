import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Alert, Snackbar } from '@mui/material'
import { FeedbackContext } from './feedbackContext'
import type { FeedbackSeverity } from './feedbackContext'

interface FeedbackMessage {
  /** Bumped on every notify so repeating the same text re-opens the toast. */
  key: number
  text: string
  severity: FeedbackSeverity
}

/**
 * One snackbar for the whole Settings module.
 *
 * Held above the section outlet so a toast survives the section unmounting —
 * "Location deleted" should not vanish because the delete also closed the row
 * that triggered it.
 */
export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<FeedbackMessage | null>(null)

  const notify = useCallback(
    (text: string, severity: FeedbackSeverity = 'success') => {
      setMessage((current) => ({
        key: (current?.key ?? 0) + 1,
        text,
        severity,
      }))
    },
    [],
  )

  const value = useMemo(() => ({ notify }), [notify])

  return (
    <FeedbackContext value={value}>
      {children}

      <Snackbar
        // Remounting on `key` restarts the auto-hide timer for a repeat message.
        key={message?.key}
        open={message !== null}
        autoHideDuration={4000}
        onClose={(_, reason) => {
          // A click anywhere else should not dismiss the only record of what
          // just happened.
          if (reason !== 'clickaway') setMessage(null)
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={message?.severity ?? 'success'}
          variant="filled"
          onClose={() => setMessage(null)}
          sx={{ width: '100%' }}
        >
          {message?.text}
        </Alert>
      </Snackbar>
    </FeedbackContext>
  )
}
