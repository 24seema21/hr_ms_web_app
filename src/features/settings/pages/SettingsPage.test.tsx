import { describe, expect, it } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { UserEvent } from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { ThemeProvider } from '@/shared/context/ThemeProvider'
import { SettingsPage } from './SettingsPage'

/*
  A smoke test for the module as a whole rather than a suite per section.

  There is no API seam here — the sections are mock-only — so what is worth
  asserting is the wiring the user actually touches: that a section loads at
  all (each one is a lazy chunk), that switching sections works, and that a
  mock mutation reaches both the table and the snackbar.
*/

/** Renders the shell and waits for the default section's chunk to arrive. */
async function renderSettings(): Promise<UserEvent> {
  const user = userEvent.setup()

  render(
    <ThemeProvider>
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    </ThemeProvider>,
  )

  await screen.findByRole('heading', { name: 'Onboarding Management' })
  return user
}

/** Moves to a section by clicking its tab, then waits for its heading. */
async function openSection(
  user: UserEvent,
  tabName: string,
  headingName: string,
) {
  await user.click(screen.getByRole('tab', { name: new RegExp(tabName, 'i') }))
  await screen.findByRole('heading', { name: headingName })
}

describe('SettingsPage', () => {
  it('opens on the onboarding section with its stages loaded', async () => {
    await renderSettings()

    expect(screen.getByText('Documentation')).toBeInTheDocument()
    expect(screen.getByText('IT Setup')).toBeInTheDocument()
    expect(
      screen.getByText('Signed offer letter received'),
    ).toBeInTheDocument()
  })

  it('switches between every section', async () => {
    const user = await renderSettings()

    await openSection(user, 'Locations', 'Location Configuration')
    expect(screen.getByText('Pune HQ')).toBeInTheDocument()

    await openSection(user, 'Leave Types', 'Leave Type Configuration')
    expect(screen.getByText('Earned Leave')).toBeInTheDocument()

    await openSection(user, 'Probation', 'Probation Period Configuration')
    expect(screen.getByText('30-day settling-in review')).toBeInTheDocument()

    await openSection(user, 'User Roles', 'User Role Configuration')
    expect(screen.getByText('HR Manager')).toBeInTheDocument()
  })

  it('marks the active tab and points it at the visible panel', async () => {
    const user = await renderSettings()
    await openSection(user, 'Locations', 'Location Configuration')

    const tab = screen.getByRole('tab', { name: /Locations/i })
    expect(tab).toHaveAttribute('aria-selected', 'true')

    const panelId = tab.getAttribute('aria-controls')
    expect(screen.getByRole('tabpanel')).toHaveAttribute('id', panelId)
  })

  it('adds a location and confirms it in a snackbar', async () => {
    const user = await renderSettings()
    await openSection(user, 'Locations', 'Location Configuration')

    await user.click(screen.getByRole('button', { name: 'Add location' }))

    const dialog = await screen.findByRole('dialog')
    await user.type(
      within(dialog).getByLabelText(/Location name/i),
      'Chennai Delivery',
    )
    await user.type(within(dialog).getByLabelText(/Address/i), '9 Anna Salai')
    await user.type(within(dialog).getByLabelText(/City/i), 'Chennai')
    await user.type(
      within(dialog).getByLabelText(/State or region/i),
      'Tamil Nadu',
    )

    await user.click(within(dialog).getByRole('combobox', { name: /Country/i }))
    await user.click(await screen.findByRole('option', { name: 'India' }))

    await user.click(within(dialog).getByRole('combobox', { name: /Timezone/i }))
    await user.click(await screen.findByRole('option', { name: 'Asia/Kolkata' }))

    await user.click(
      within(dialog).getByRole('button', { name: 'Add location' }),
    )

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
    expect(screen.getByText('Chennai Delivery')).toBeInTheDocument()
    expect(await screen.findByText('Chennai Delivery added')).toBeInTheDocument()
  })

  it('refuses to save a location with no name', async () => {
    const user = await renderSettings()
    await openSection(user, 'Locations', 'Location Configuration')

    await user.click(screen.getByRole('button', { name: 'Add location' }))

    const dialog = await screen.findByRole('dialog')
    await user.click(
      within(dialog).getByRole('button', { name: 'Add location' }),
    )

    expect(
      await screen.findByText('Location name is required'),
    ).toBeInTheDocument()
    // Still open, rather than having silently discarded the input.
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('deletes a location only after the confirmation is accepted', async () => {
    const user = await renderSettings()
    await openSection(user, 'Locations', 'Location Configuration')

    await user.click(screen.getByRole('button', { name: 'Delete Pune HQ' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    /*
      Waiting for the dialog to actually leave the tree, not just for the click
      to return. MUI marks the background `aria-hidden` while a modal is open,
      and Testing Library skips hidden elements — querying the row again too
      early reports "unable to find" for a button that is on screen.
    */
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
    expect(screen.getByText('Pune HQ')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Delete Pune HQ' }))
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    await waitFor(() =>
      expect(screen.queryByText('Pune HQ')).not.toBeInTheDocument(),
    )
  })

  it('grants a whole module from the role permission matrix', async () => {
    const user = await renderSettings()
    await openSection(user, 'User Roles', 'User Role Configuration')

    // Anchored, so this picks the role's own list button rather than the
    // "Edit Finance" / "Delete Finance" actions beside it.
    await user.click(screen.getByRole('button', { name: /^Finance/ }))

    const settingsRowToggle = screen.getByRole('checkbox', {
      name: 'All Settings permissions for Finance',
    })
    expect(settingsRowToggle).not.toBeChecked()

    await user.click(settingsRowToggle)

    expect(settingsRowToggle).toBeChecked()
    expect(
      screen.getByRole('checkbox', { name: 'Delete Settings — Finance' }),
    ).toBeChecked()
  })

  it('locks the administrator matrix so nobody can be shut out', async () => {
    const user = await renderSettings()
    await openSection(user, 'User Roles', 'User Role Configuration')

    // Administrator is the default selection.
    expect(
      screen.getByRole('checkbox', { name: 'Delete Settings — Administrator' }),
    ).toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'Delete Administrator' }),
    ).toBeDisabled()
  })
})
