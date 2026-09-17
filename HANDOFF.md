# Handoff

## Current state (17 September 2026)

Phase 1 is built. `main` deploys to GitHub Pages at https://tomrosscd.github.io/cd-brand-tools/ (public, by Tom's decision). Plan and open decisions: [docs/PLAN.md](docs/PLAN.md).

### Built

- **Setup:** Next.js 16 static export, Product UI 0.13.0 pinned, untouched sources in `assets/source`, generated manifests (`pnpm assets`), brand colours in `src/brand/colours.ts`.
- **Brand guide:** Colours (copy values), Typography, Logos (filter, download originals), Stacks (any brand colour, background on or off, tightly cropped PNG at 2000px wide and SVG). Stack crop bounds are computed in `scripts/build-stacks.mjs`.
- **Stack creator** (`/create/stack/`): canvas size at the top of the panel (presets or custom), stack picker, colour, drag/keys/sliders, background as colour, gradient or transparent, logo overlay, undo, reset, randomise, SVG/PNG/JPEG, shareable link.
- **Gradient generator** (`/create/gradient/`): WebGL shader, OKLab blending, chaos, grain, seeds, 2 to 5 colours. Default is "Dark glow" (Dark Green leading, Light Green glow, chaos 10, grain 18), matched to Tom's reference images. The first colour gets about three times the pull of the others, and the falloff is soft.
- **Hosting:** `.github/workflows/pages.yml` builds with `NEXT_PUBLIC_BASE_PATH=/cd-brand-tools` and deploys `out/`. `.github/workflows/ci.yml` runs `format:check` and `pnpm check`. Plain links and files use `withBase()` from `src/lib/base-path.ts`; `next/link` and the router add the base path themselves. Tool pages read their state with `useSearchParams` inside `Suspense`, because a static export has no server.

### Copy to Figma (branch `feature/copy-to-figma`)

- Logos and Stacks cards have a Copy button. SVG assets copy as clean SVG text (`geometryToSvg` in `src/lib/svg-markup.ts`: supplied geometry and colour, no Illustrator prolog, ids, classes or style blocks), which Figma pastes as editable vectors. PNG logos copy as PNG images. Clipboard writes use `ClipboardItem` with a promise so Safari keeps the click permission (`src/lib/clipboard.ts`).
- Both pages have a Background toggle applying to copies and downloads. Logos default to automatic contrast (Dark Green behind White and Light Green, White behind the others) or any brand colour; a colour matching the logo falls back to contrast. With the background off, logo downloads are the untouched originals. Profile icons and JPEGs already carry a background, so the toggle is hidden for them.
- Cards use a fixed-width auto-fill grid, so a single result no longer stretches across the page.
- Verified against `pnpm dev` with clipboard permissions: logo SVG copy has no background rect when off and a full-viewBox Dark Green rect when on; Light Green PNG logo copies 3843×576, corner alpha 0 when off and Dark Green when on; stack SVG copy with and without background; untouched original downloads with background off; 25 tests, type-check and lint pass. **Pasting into Figma itself has not been tested** (no Figma access from the session).

### Fixed after Tom's first local test

- Gradient preview failed in `pnpm dev` with "Shader failed to compile: null". React mounts twice in development and `dispose()` called `loseContext()`, killing the canvas's only WebGL context. `dispose()` now frees resources only, and each render re-selects its own program. Headless checks had used the production build, which mounts once, so they missed it. **Check tool pages in `pnpm dev` as well as the build.**
- Two controls were both labelled "Size". Now "Canvas size" and "Stack size".
- Tag Assistant extension hydration warning suppressed on `<html>` only.

### Verified on 17 September 2026

- `pnpm format:check` and `pnpm check` (assets manifest, type-check, lint, 22 tests, build) pass.
- Against `pnpm dev` (headless Chromium, SwiftShader): gradient and stack creator render with no errors or WebGL warnings; canvas size presets and custom size update the frame (1000×1250 measured 0.800); stacks page PNG is 2000×1224 for Stack 05, transparent corner alpha 0 with background off and Dark Green with it on.
- Static export served under `/cd-brand-tools/`: navigation, all logo images, gradient export, stack creator from a link, stacks PNG download and "Use" links all work; no failed requests or console errors.
- Earlier: exports at preset sizes match previews; SVG exports carry no ids.

### Not verified

- The live Pages deployment until the first workflow run finishes.
- Real GPUs, Safari and Firefox, 4K and 8192px exports, screen reader pass, dark theme.
- The in-app browser pane still starts Product UI's Storybook; verification used Playwright scripts in the session scratchpad.

## Next

1. Confirm the Pages deployment and try it in Safari.
2. Resolve open decisions in PLAN.md (print values, black icon, rotation, logo overlay scope).
3. Phase 2 needs a server host: GitHub Pages cannot do sign-in or gated downloads.

## Product UI gaps found (candidates for a reviewed Product UI change)

- No slider/range component: `src/components/range-field.tsx` is local.
- No colour swatch radio group: `src/components/swatch-picker.tsx` is local.
- The curated icon set has no image, palette or shuffle icons; Generate another uses `loading`.
- `SegmentedControl` does not wrap, so it overflows in a narrow panel with more than about four options.
- `ToastRegion` messages stack up quickly during repeated downloads.
