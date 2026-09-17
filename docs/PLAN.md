# Project plan

Convert Brand Tools is a standalone internal application. Staff use it to understand the Convert brand, download approved assets, and make on-brand imagery. It consumes `@convert/product-ui` as a pinned dependency for its interface. The tools, brand data and hosted brand assets live in this repository.

This plan supersedes the Brand Hub planning documents of 8 September 2026. They are preserved unchanged in [docs/history](history/) and remain the record of the approved brief. Where this plan differs, the difference is called out.

## What changed from the Brand Hub plan

| Brand Hub plan (8 Sept)                 | This plan (17 Sept)                                                                       |
| --------------------------------------- | ----------------------------------------------------------------------------------------- |
| Planning only, no build authorisation   | Tom authorised the build on 17 September 2026                                             |
| "Brand Hub", no remote                  | "Convert Brand Tools", `github.com/tomrosscd/cd-brand-tools`                              |
| Product UI foundation update first      | Not a blocker. Product UI 0.13.0 already ships the logo components and brand asset list   |
| Stack creator was the only generator    | Adds a noise and mesh gradient generator, restricted to brand colours                     |
| Logo downloads copied inside Product UI | This repository hosts brand assets. Product UI keeps its own copy for its components only |

## Stack

- Next.js 16 App Router, React 19, TypeScript strict. Chosen because phase 2 needs server-side Google sign-in and protected downloads, which a static site cannot enforce.
- `@convert/product-ui` 0.13.0, installed from the GitHub release tarball with an exact version. Upgrade in a dedicated change.
- Plain CSS modules on Product UI tokens (`--cui-*`). No Tailwind, matching Product UI.
- Vitest for pure logic (composition state, SVG serialisation, gradient maths, URL state). Browser checks for rendering and export.
- pnpm, Node 22.

## Architecture

```
assets/source/            Supplied originals. Never edited.
  CD_Stacks/              36 stack SVGs
  Convert_Logos_2024/     Logo archive, 80 files plus the Illustrator source
scripts/
  build-assets.mjs        Publishes originals to public/brand, writes the asset manifest
  build-stacks.mjs        Audits stack geometry, writes the stack module
src/brand/                Brand data: colours, asset manifest, stack geometry
src/lib/                  Framework-free logic: composition state, SVG export, gradient, raster export
src/app/                  Routes
src/components/           Application components composed from Product UI
```

Rules that keep the tools honest:

1. **State first, view second.** Each tool keeps a plain serialisable state object. The preview and every export are generated from that state, so what you see is what you export.
2. **One brand data source.** Every colour picker, gradient and export reads `src/brand/colours.ts`. No hex values elsewhere.
3. **Geometry is read-only.** Stack and logo shapes come from generated modules. Tools transform the whole artwork, never its parts.
4. **Shareable by URL.** Tool state round-trips through the query string, so a composition can be sent as a link. No database in phase 1.

## Phases

### Phase 0: setup and asset audit. Done 17 Sept.

- [x] Recover the Brand Hub brief and plan
- [x] Create the repository, scaffold Next.js, pin Product UI 0.13.0
- [x] Import the stack and logo archives as untouched originals
- [x] Audit all 36 stacks: three paths each, one fill (`#C9DEB6`), no transforms. The build script fails if this changes
- [x] Audit logo SVGs and record provenance (SHA-256 per file)
- [x] Centralise brand colours, transcribe CMYK and Pantone, flag them unverified

### Phase 1A: application shell and brand guide

- [ ] Application shell with `DashboardShell`: Overview, Colours, Logos, Stacks, Stack creator, Gradient generator
- [ ] Colours: swatches with copyable HEX, RGB, CMYK and Pantone, with copy feedback
- [ ] Logos: filter by family, colour, format and clear space. Preview on a suitable background, download the original
- [ ] Stacks library: preview and download each original
- [ ] Typography guidance: Roobert, Denton x Condensed, and the Google alternatives. No font downloads until phase 2

Verify: responsive layout at 1440 and 390, keyboard navigation, copy feedback, downloaded file checksums match the manifest.

### Phase 1B: stack creator

- [ ] Choose one of 36 stacks. Randomise changes only the stack
- [ ] One approved colour for the whole stack
- [ ] Move and scale, including past the frame edge so the export crops. Numeric inputs and nudge buttons as the keyboard alternative to dragging
- [ ] Frame presets and custom size (see presets below)
- [ ] Background: any approved colour, or transparent
- [ ] Optional logo overlay: logo, straight logo or icon, in its official colour variants, at a position preset and size
- [ ] Undo and reset
- [ ] Export SVG, PNG and JPEG. JPEG requires a background and says so
- [ ] Shareable link

Verify: exported pixel dimensions, edge cropping, transparency, SVG/PNG/JPEG visual agreement, all 36 stacks render, no SVG ID collisions, export limit error handling.

### Phase 1C: gradient generator (new)

Recreates the Noise & Gradient idea (`noiseandgradient.com`) inside the brand: soft mesh gradients with film grain, built only from Convert colours. Our own implementation, not a copy of that site's code.

- [ ] Choose two to five brand colours, in order. Add, remove and reorder
- [ ] Chaos: how far the colour fields warp and swirl, 0 to 1
- [ ] Grain: film grain strength, 0 to 1
- [ ] Seed: "Generate another" and the space bar produce a new arrangement. The seed is shown and editable, so a result can be reproduced
- [ ] Curated palettes as starting points, for example Dark Green with Forest and Light Green, or Dark Green with a small Orange accent
- [ ] Frame presets shared with the stack creator. Export PNG and JPEG at full preset size (the original site caps free exports at 1000px)
- [ ] Shareable link: `?colours=dark-green,forest-green,light-green&chaos=0.4&grain=0.15&seed=…`

Technique: a WebGL fragment shader. Each colour is a soft field centred on a seeded random point. Domain-warped noise, scaled by chaos, bends the coordinates before blending. Grain is hashed per-pixel noise. The same shader renders the preview and, on an offscreen canvas, the export, so results match. A Canvas 2D fallback renders the same maths more slowly where WebGL is unavailable.

Verify: identical seed gives identical output, preview matches export, export dimensions, grain visible at export size, no colours outside the selected palette before grain.

### Phase 1D: tools together

- [ ] Gradient as a stack creator background. Needs a scope decision (see decisions)
- [ ] Deploy a private preview (Vercel) behind the platform's own protection until phase 2 access exists

### Phase 2: access and saved work

Google company sign-in, invited users, gated downloads including fonts, saved presets and curated starting compositions. Verify routes and direct asset URLs for anonymous, invited and employee users. Private font files never enter the public bundle or this repository while it is public.

### Phase 3: richer artwork

Image masking through an unchanged stack silhouette. The "Commerce That Stacks Up" tagline lockup once supplied. No text editing or shape editing without a scope decision.

## Frame presets

Proposed, to confirm during phase 1B:

| Preset                  | Size (px)  |
| ----------------------- | ---------- |
| Widescreen slide (16:9) | 1920×1080  |
| Widescreen slide, 4K    | 3840×2160  |
| Square post             | 1080×1080  |
| Portrait post (4:5)     | 1080×1350  |
| LinkedIn banner         | 1584×396   |
| LinkedIn post           | 1200×627   |
| Desktop wallpaper       | 2560×1440  |
| Phone wallpaper         | 1179×2556  |
| Custom                  | 16 to 8192 |

Export limit: 8192 px per side and 40 megapixels in total, to be confirmed by testing in Safari, which has the smallest canvas limit.

## Open decisions

1. **Repository visibility.** `cd-brand-tools` is currently public. The stack artwork and logos are already public in `cd-product-ui`, so phase 1 is not blocked, but fonts and anything gated in phase 2 must not be committed while public. Recommend making it private before phase 2.
2. **Rotation and flipping** in the stack creator. The desktop wallpaper references show stacks at varied angles, which the source geometry already carries. Recommend leaving rotation out of phase 1.
3. **Logo overlay scope.** Proposed: one overlay, from Logo, Straight or Icon, in official colour variants only.
4. **Gradient backgrounds in the stack creator.** Recommend yes, as phase 1D, reusing the gradient state.
5. **Gradient colour limits.** Whether accents (Yellow, Orange) may lead a gradient or only appear alongside a green.
6. **Print values.** CMYK and Pantone were read from a page-resolution image. Confirm against the original brand book before showing them as approved.
7. **Black icon colour.** `Convert_Icon_Black.svg` and its clear-space version use `#231f20`, not the brand Black `#171717`. Leave the downloads untouched, confirm with the brand owner.
8. **Illustrator source.** Whether `Convert_Brand Logos_All (for export use).ai` is offered as a download. Currently kept in sources only.
9. **Hosting.** Vercel is assumed for phase 1D.

## Git and releases

Focused feature branches and reviewed pull requests into `main`. Record verified results in HANDOFF.md, not planned checks. Upgrade Product UI in its own change. Application releases are independent of Product UI releases.
