import { Suspense, useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import {
  Box,
  Card,
  ScopedCssBaseline,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import { useTheme as useAppTheme } from '@/shared/hooks/useTheme'
import { SettingsNav } from '../components/SettingsNav'
import { FeedbackProvider } from '../context/FeedbackProvider'
import { panelId, tabId } from '../lib/tabIds'
import {
  DEFAULT_SECTION_ID,
  SETTINGS_SECTIONS,
  isSettingsSectionId,
} from '../sections/registry'
import { createSettingsTheme } from '../theme/settingsTheme'
import type { SettingsSectionId } from '../types'

/** Holds the page's shape while a section chunk downloads. */
function SectionFallback() {
  return (
    <Box aria-busy="true">
      <span role="status" style={{ position: 'absolute', left: -9999 }}>
        Loading settings section…
      </span>
      <Skeleton variant="text" width={260} height={40} />
      <Skeleton variant="text" width={420} />
      <Skeleton
        variant="rectangular"
        height={320}
        sx={{ mt: 3, borderRadius: 3 }}
      />
    </Box>
  )
}

/**
 * The Settings shell: a persistent section navigation and one lazily-loaded
 * configuration screen beside it.
 *
 * This is the only MUI-rendered page in the app, so it carries its own
 * `ThemeProvider` built from the product's design tokens, and a
 * `ScopedCssBaseline` rather than the global `CssBaseline` — a global baseline
 * would reset typography and box-sizing for every Tailwind screen outside this
 * subtree as well.
 */
export function SettingsPage() {
  const { theme: mode } = useAppTheme()

  // Rebuilt only when light/dark flips: `createTheme` walks and freezes the
  // whole object, and a new identity re-renders every styled child.
  const muiTheme = useMemo(() => createSettingsTheme(mode), [mode])

  /*
    The active section lives in the URL rather than in state, so a particular
    settings screen can be linked to, and the browser's back button steps
    between sections instead of leaving the module altogether.
  */
  const [searchParams, setSearchParams] = useSearchParams()
  const requested = searchParams.get('section')
  const activeId = isSettingsSectionId(requested)
    ? requested
    : DEFAULT_SECTION_ID

  const handleChange = useCallback(
    (section: SettingsSectionId) => {
      // `replace` so five clicks through the nav do not put five entries
      // between the user and the page they arrived from.
      setSearchParams({ section }, { replace: true })
    },
    [setSearchParams],
  )

  const activeSection =
    SETTINGS_SECTIONS.find((section) => section.id === activeId) ??
    SETTINGS_SECTIONS[0]

  return (
    <ThemeProvider theme={muiTheme}>
      <ScopedCssBaseline sx={{ bgcolor: 'background.default', minHeight: '100%' }}>
        <FeedbackProvider>
          <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 3, sm: 4 } }}>
            <Stack spacing={0.5} sx={{ mb: 3 }}>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                Settings
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Configure how onboarding, locations, leave and access control
                behave across the organisation.
              </Typography>
            </Stack>

            <Box
              sx={{
                display: 'grid',
                gap: 3,
                alignItems: 'start',
                gridTemplateColumns: { xs: '1fr', md: '272px minmax(0, 1fr)' },
              }}
            >
              <Card
                sx={{
                  // Sticks beside a long section on desktop; on a phone it is
                  // a scrollable strip at the top and must not float.
                  position: { md: 'sticky' },
                  top: { md: 88 },
                  overflow: 'hidden',
                }}
              >
                <SettingsNav activeId={activeId} onChange={handleChange} />
              </Card>

              {/*
                `minWidth: 0` is what lets the wide tables inside scroll within
                their own container — without it a grid child takes its content's
                width as its minimum and pushes the whole page sideways.
              */}
              <Box
                role="tabpanel"
                id={panelId(activeId)}
                aria-labelledby={tabId(activeId)}
                sx={{ minWidth: 0 }}
              >
                {/*
                  Keyed on the section so switching remounts rather than reusing
                  the previous section's state, and re-suspends cleanly while the
                  next chunk downloads.
                */}
                <Suspense key={activeId} fallback={<SectionFallback />}>
                  <activeSection.Component onNavigate={handleChange} />
                </Suspense>
              </Box>
            </Box>
          </Box>
        </FeedbackProvider>
      </ScopedCssBaseline>
    </ThemeProvider>
  )
}
