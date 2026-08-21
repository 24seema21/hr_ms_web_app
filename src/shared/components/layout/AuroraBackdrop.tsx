/**
 * The atmosphere the v2 design floats on.
 *
 * Three very large, very soft colour fields — jade, violet and a low marigold
 * warm spot — plus a film of grain over the top. It is `fixed` rather than
 * `absolute` on purpose: the field stays put while content scrolls over it, so
 * a page reads as panels moving across a lit surface instead of one long
 * picture sliding past.
 *
 * Everything here is decoration, so the whole thing is hidden from the
 * accessibility tree and cannot receive a pointer event.
 *
 * It lives in `shared/` rather than beside the landing page because it is no
 * longer one page's backdrop: it is the ground the product's public surfaces
 * stand on, and the login page is the second of them.
 *
 * Two things a caller has to provide, or the effect does not work: a stacking
 * context (`isolate`) on the wrapper, so `z-0` here and `z-10` on the content
 * are settled locally, and an opaque page background — the blobs are lights
 * *on* a ground, not a substitute for one.
 *
 * ── On the grain ─────────────────────────────────────────────────────────────
 * The noise layer is not a texture affectation. Gradients this large and this
 * soft band visibly on 8-bit displays — concentric rings where the blur is
 * gentlest — and a few percent of noise dithers them away. It is also the
 * cheapest way to stop a two-colour blur from looking like stock artwork.
 */
export function AuroraBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/*
        Sized in `rem` and positioned in `%` so the composition holds its shape
        across viewports: the blobs grow with the type scale, and their centres
        stay in the same relative place on a phone as on a monitor.
      */}
      <div className="absolute -top-48 -left-40 h-[38rem] w-[38rem] rounded-full bg-nx-jade opacity-[0.22] blur-[130px]" />
      <div className="absolute top-[8%] -right-40 h-[34rem] w-[34rem] rounded-full bg-nx-violet opacity-[0.16] blur-[140px]" />
      <div className="absolute top-[52%] left-[30%] h-[30rem] w-[30rem] rounded-full bg-nx-amber opacity-[0.1] blur-[150px]" />

      {/*
        `mix-blend-overlay` rather than a flat overlay: the grain then darkens
        the light parts and lightens the dark parts instead of greying the
        whole page, which is what keeps it invisible as texture and effective
        as dithering.
      */}
      <div className="nx-noise absolute inset-0 opacity-[0.035] mix-blend-overlay" />
    </div>
  )
}
