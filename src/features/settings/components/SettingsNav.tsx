import { Box, Tab, Tabs, Typography, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { panelId, tabId } from '../lib/tabIds'
import { SETTINGS_SECTIONS } from '../sections/registry'
import type { SettingsSectionId } from '../types'

interface SettingsNavProps {
  activeId: SettingsSectionId
  onChange: (section: SettingsSectionId) => void
}

/**
 * The persistent settings navigation.
 *
 * One `Tabs` in two orientations rather than a sidebar list and a separate
 * mobile dropdown: MUI's tab implementation already provides roving focus,
 * arrow-key movement and the `tablist`/`tab`/`tabpanel` relationships, so the
 * keyboard and screen-reader behaviour is identical at every width and there is
 * only one component to keep correct.
 */
export function SettingsNav({ activeId, onChange }: SettingsNavProps) {
  const theme = useTheme()
  const isWide = useMediaQuery(theme.breakpoints.up('md'))

  return (
    <Tabs
      orientation={isWide ? 'vertical' : 'horizontal'}
      variant={isWide ? 'standard' : 'scrollable'}
      scrollButtons={isWide ? false : 'auto'}
      allowScrollButtonsMobile
      value={activeId}
      onChange={(_, value: SettingsSectionId) => onChange(value)}
      aria-label="Settings sections"
      sx={{
        borderRight: isWide ? 1 : 0,
        borderBottom: isWide ? 0 : 1,
        borderColor: 'divider',
        '& .MuiTab-root': {
          alignItems: isWide ? 'flex-start' : 'center',
          textAlign: isWide ? 'left' : 'center',
          minHeight: 56,
        },
      }}
    >
      {SETTINGS_SECTIONS.map((section) => (
        <Tab
          key={section.id}
          value={section.id}
          id={tabId(section.id)}
          aria-controls={panelId(section.id)}
          icon={<section.Icon fontSize="small" />}
          iconPosition="start"
          label={
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {section.label}
              </Typography>
              {/*
                The one-line summary is desktop-only — on a scrollable strip it
                would force each tab wide enough to hide the ones beside it.
              */}
              {isWide ? (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', textTransform: 'none' }}
                >
                  {section.summary}
                </Typography>
              ) : null}
            </Box>
          }
          sx={{ px: 2 }}
        />
      ))}
    </Tabs>
  )
}
