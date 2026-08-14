import type { SettingsSectionId } from '../types'

/*
  The `aria-controls`/`aria-labelledby` pair that ties a tab to its panel.

  In their own module rather than beside `SettingsNav`, because Vite's fast
  refresh only preserves state in files that export components *and nothing
  else* — the same reason `app/lazyPages.ts` exists.
*/

export function tabId(section: SettingsSectionId): string {
  return `settings-tab-${section}`
}

export function panelId(section: SettingsSectionId): string {
  return `settings-panel-${section}`
}
