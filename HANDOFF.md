# Handoff

## Current state (17 September 2026)

Branch `feature/phase-1-tools`, committed locally, **not pushed**. `main` has one local commit (phase 0 setup), also **not pushed**. The GitHub repository `tomrosscd/cd-brand-tools` is still empty and public. Plan and open decisions: [docs/PLAN.md](docs/PLAN.md).

### Built

- Phase 0: scaffold, Product UI 0.13.0 pinned, untouched source archives in `assets/source`, audited geometry, generated manifests, brand colour data.
- Phase 1A: `DashboardShell` app shell; Overview, Colours (copy HEX/RGB/CMYK/Pantone, toast feedback), Typography, Logos (filter by type, colour, format, clear space; download originals), Stacks (preview, download, open in creator).
- Phase 1B: Stack creator at `/create/stack`. Stack picker, one brand colour, drag / arrow keys / plus-minus / sliders with number inputs, crop past the frame, background colour or transparent, logo overlay (official colour files only, nine positions, size), undo (button and Cmd/Ctrl+Z), reset, randomise stack only, presets and custom size with limits, SVG/PNG/JPEG export (JPEG falls back to White and says so), state in URL, copy link.
- Phase 1C: Gradient generator at `/create/gradient`. WebGL shader, OKLab blending, domain-warped noise (chaos), per-pixel grain, seeded layout, 2 to 5 brand colours with reorder/remove/add, starting palettes, space bar and button for a new seed, tiled full-size PNG/JPEG export, state in URL.

### Verified on 17 September 2026

- `pnpm type-check`, `pnpm lint`, `pnpm test` (16 tests), `pnpm build` all pass. `pnpm format` applied.
- Headless Chromium (Playwright from `../convert-product-ui`, SwiftShader WebGL) against `next start`: all pages load with no console errors; no broken logo images; gradient renders and the space bar changes seed and image; gradient PNG export is 1920×1080; stack arrow key moves x 0.90 to 0.89; stack PNG and JPEG exports are 1584×396 and visually match the preview; SVG export has no ids or classes; no horizontal scroll at 390px on the stack creator.
- Screenshots reviewed for overview, logos, gradient and stack creator at 1440px.

### Not verified

- Real GPU browsers (only SwiftShader), Safari and Firefox, 4K and 8192px exports, the 40 MP limit in Safari.
- Screen reader pass, full keyboard walkthrough of every control, dark theme.
- Visual review of Colours, Typography and Stacks pages and the mobile layout of the gradient generator.
- The in-app browser pane could not be used this session: it was still bound to Product UI's `.claude/launch.json`. A `brand-tools` launch config now exists in this repository (port 3100).

## Next

1. Tom: decide repository visibility (see PLAN open decision 1), then push `main` and the feature branch and open a pull request.
2. Browser review in real Chrome and Safari, including large exports.
3. Resolve the open decisions in PLAN.md, especially print values and rotation.
4. Phase 1D: gradient backgrounds in the stack creator, private preview deployment.

## Product UI gaps found (candidates for a reviewed Product UI change)

- No slider/range component: `src/components/range-field.tsx` is local.
- No colour swatch radio group: `src/components/swatch-picker.tsx` is local.
- The curated icon set has no image, palette or shuffle icons; Generate another uses `loading`.
- `SegmentedControl` does not wrap, so it overflows in a narrow panel with more than about four options.
