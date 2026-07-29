import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// We import `defineConfig` from 'vitest/config' rather than 'vite' so that the
// `test` block below is type-checked. It is the same Vite config object, just
// widened with Vitest's options.
export default defineConfig({
  plugins: [react(), tailwindcss()],

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
})
