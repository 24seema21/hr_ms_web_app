// Adds the DOM-aware assertions used across the test suite —
// `toBeInTheDocument()`, `toBeDisabled()`, `toHaveAttribute()` and friends.
// The import also carries a TypeScript module augmentation, which is why
// `expect(...).toBeInTheDocument()` type-checks in every test file.
import '@testing-library/jest-dom/vitest'
