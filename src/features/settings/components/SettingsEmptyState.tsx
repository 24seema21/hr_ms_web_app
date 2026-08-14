import { Box, Typography } from '@mui/material'
import type { ReactNode } from 'react'

interface SettingsEmptyStateProps {
  title: string
  description: string
  action?: ReactNode
}

/** Shown when a section's list has been emptied, in place of a bare table. */
export function SettingsEmptyState({
  title,
  description,
  action,
}: SettingsEmptyStateProps) {
  return (
    <Box
      sx={{
        px: 3,
        py: 6,
        textAlign: 'center',
        borderRadius: 3,
        border: 1,
        borderStyle: 'dashed',
        borderColor: 'divider',
      }}
    >
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
        {title}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mx: 'auto', maxWidth: 420 }}
      >
        {description}
      </Typography>
      {action ? <Box sx={{ mt: 3 }}>{action}</Box> : null}
    </Box>
  )
}
