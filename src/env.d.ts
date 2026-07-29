/// <reference types="vite/client" />

/*
  Vite exposes every `VITE_`-prefixed variable on `import.meta.env`, but out of
  the box they are typed as `any`. That means a typo — `VITE_API_BASE_UR` —
  compiles happily and is `undefined` at runtime, which surfaces as a baffling
  request to `/login` with no host in front of it.

  Declaring them here turns that class of mistake into a compile error.
*/
interface ImportMetaEnv {
  /**
   * Origin of the HRMS backend, e.g. `http://localhost:8080`.
   *
   * Optional on purpose: `src/shared/lib/httpClient.ts` falls back to the local
   * backend so `npm run dev` works on a fresh clone with no `.env.local`.
   */
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
