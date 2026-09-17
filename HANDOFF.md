# Handoff

## Current state (17 September 2026)

Phase 0 is complete. See [docs/PLAN.md](docs/PLAN.md) for the plan and open decisions.

- Repository `tomrosscd/cd-brand-tools` cloned locally beside `convert-product-ui`. It was empty and is **public**.
- Next.js 16.3.5 App Router scaffold, pnpm, Node 22.
- `@convert/product-ui` 0.13.0 pinned by exact release tarball.
- `assets/source` holds the untouched originals: `CD_Stacks.zip` (36 SVG) and `Convert_Logos_2024 (2) 2.zip` (80 files plus the `.ai`), both from `~/Downloads`, supplied 8 September 2026.
- `scripts/build-stacks.mjs` audits every stack (three paths, one fill, no transforms) and writes `src/brand/stacks.generated.ts`. All 36 pass.
- `scripts/build-assets.mjs` publishes logos and stacks to `public/brand` (ignored by Git) and writes `src/brand/assets.generated.ts` with provenance and SHA-256.
- `src/brand/colours.ts` is the single brand colour source. CMYK and Pantone are transcribed from the PDF image and flagged `printVerified: false`.
- Brand Hub planning docs copied unchanged to `docs/history`. The originals remain in `../convert-brand-hub`.

## Next

Phase 1A and 1B/1C on a feature branch: application shell, brand guide pages, gradient generator, stack creator.
