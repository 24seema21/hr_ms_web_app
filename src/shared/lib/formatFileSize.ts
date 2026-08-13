/**
 * `183000` → `179 KB`, `5242880` → `5 MB`, `1468006` → `1.4 MB`.
 *
 * Sizes people recognise, not bytes. Lives in `shared/lib/` rather than beside
 * either of its callers because the upload field and the schema that rejects
 * an oversized file must agree to the character — "5 MB" in the hint next to
 * "the limit is 5.0 MB" in the error reads as two different limits.
 *
 * The decimal is dropped on a whole number and above 10 MB: "5.0 MB" looks
 * like a rounding artefact and "11.3 MB" is more precision than the sentence
 * needs.
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`

  const megabytes = bytes / (1024 * 1024)
  if (megabytes >= 10 || Number.isInteger(megabytes)) {
    return `${Math.round(megabytes)} MB`
  }
  return `${megabytes.toFixed(1)} MB`
}
