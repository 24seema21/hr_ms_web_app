// Adds the DOM-aware assertions used across the test suite —
// `toBeInTheDocument()`, `toBeDisabled()`, `toHaveAttribute()` and friends.
// The import also carries a TypeScript module augmentation, which is why
// `expect(...).toBeInTheDocument()` type-checks in every test file.
import '@testing-library/jest-dom/vitest'

/*
  `window.matchMedia`, which jsdom does not implement at all.

  Anything that reads a media query from JavaScript — the theme provider's
  `prefers-color-scheme` subscription — throws "matchMedia is not a function"
  without this. jsdom has declined to implement it for years because it has no
  layout engine to answer most queries from, so a stub is the standard answer.

  It reports light and never changes, which is the right default for tests: a
  suite whose expectations depend on the host machine's appearance settings is
  a suite that fails on somebody else's laptop. A test that cares about dark
  mode should override this explicitly.
*/
if (!window.matchMedia) {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      // Deprecated, but still called by some libraries.
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList
}
