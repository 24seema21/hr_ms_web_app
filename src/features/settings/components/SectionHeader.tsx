import { Box, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'

interface SectionHeaderProps {
  title: string
  description: string
  /** Usually the section's primary "Add …" button. */
  action?: ReactNode
}

/** The title block every configuration section opens with. */
export function SectionHeader({
  title,
  description,
  action,
}: SectionHeaderProps) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      sx={{
        mb: 3,
        alignItems: { xs: 'stretch', sm: 'flex-start' },
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h5" component="h2" sx={{ mb: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Box>

      {action ? <Box sx={{ flexShrink: 0 }}>{action}</Box> : null}
    </Stack>
  )
}
