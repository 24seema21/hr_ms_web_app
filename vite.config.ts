import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import type { Plugin } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/*
  GitHub Pages serves this repository as a *project site*, which means every
  URL is prefixed with the repository name:

      https://24seema21.github.io/hr_ms_web_app/

  The leading and trailing slashes are both load-bearing. Without them Vite
  concatenates the value straight onto asset paths and emits
  `hr_ms_web_appassets/index-xxx.js`, and nothing loads.
*/
const REPO_BASE = '/hr_ms_web_app/'

/**
 * Writes `404.html` as a byte-copy of `index.html` at the end of a build.
 *
 * GitHub Pages is a plain file server with no SPA rewrite: a request for
 * /hr_ms_web_app/dashboard asks for a file that does not exist, and Pages
 * answers with 404.html. Making that file the app itself boots the same
 * bundle with the URL intact, so react-router resolves the route on the
 * client — no redirect hop and no flash of a wrong page. The only cost is
 * that Pages reports HTTP 404 on a deep link, which browsers do not show.
 */
function spaFallback(): Plugin {
  let outDir = 'dist'
  return {
    name: 'spa-404-fallback',
    // Build only: the dev server already falls back to index.html itself.
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir
    },
    closeBundle() {
      const dir = resolve(fileURLToPath(new URL('.', import.meta.url)), outDir)
      copyFileSync(resolve(dir, 'index.html'), resolve(dir, '404.html'))
    },
  }
}

// We import `defineConfig` from 'vitest/config' rather than 'vite' so that the
// `test` block below is type-checked. It is the same Vite config object, just
// widened with Vitest's options.
export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss(), spaFallback()],

  /*
    Only builds get the subpath. Leaving dev at '/' keeps the dev server on
    http://localhost:5173/ — the origin the backend's CORS config allows, and
    the URL every existing note and bookmark assumes.
  */
  base: command === 'build' ? REPO_BASE : '/',

  server: {
    /*
      Pinned, and `strictPort` so a clash fails loudly instead of quietly
      moving to 5174.

      The backend's CORS config allows exactly one origin —
      `http://localhost:5173` (HRMS_API/hr_ms_api/login/main.go). Served from
      any other port, every login request is blocked by the browser before it
      reaches Go, and the only clue is a CORS message in the console while the
      form reports "could not reach the server". Failing to start is far easier
      to diagnose.
    */
    port: 5173,
    strictPort: true,
  },

  resolve: {
    alias: {
      // Lets us write `@/shared/components/ui/Button` instead of `../../../shared/...`.
      // This half is for the bundler at runtime; tsconfig.app.json has the
      // matching half so the editor and `tsc` can resolve it too.
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  test: {
    // jsdom gives tests a fake DOM, so components can actually render in Node.
    environment: 'jsdom',
    // `describe` / `it` / `expect` available without importing them in every file.
    globals: true,
    // Runs once before the test files, to register the jest-dom matchers.
    setupFiles: ['./src/test/setup.ts'],
  },
}))
