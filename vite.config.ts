import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// We import `defineConfig` from 'vitest/config' rather than 'vite' so that the
// `test` block below is type-checked. It is the same Vite config object, just
// widened with Vitest's options.
export default defineConfig({
  plugins: [react(), tailwindcss()],

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
