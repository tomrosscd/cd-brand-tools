# Product UI 1.4.1 upgrade

Upgrade from `@convert/product-ui` 1.3.2 to 1.4.1 (4 October 2026). Sources read from the verified 1.4.1 archive: `docs/release-1.4.md` (with the 1.4.1 section), `docs/workspace-adoption.md`, `docs/page-layout.md`, `docs/component-catalogue.md`, `CHANGELOG.md`.

## Dependency

- Archive `convert-product-ui-1.4.1.tgz`, SHA-256 `90dda605985a2cc85b59cd32856c73c7ddbd9f5c28db126feb4d27ada2aa748a`, verified with `shasum -a 256 -c SHA256SUMS` against the GitHub release. Packed `package.json` version is 1.4.1.
- `vendor/` is git-ignored. `scripts/fetch-product-ui.mjs` pins version and checksum; `package.json` and `pnpm-lock.yaml` point at `file:vendor/convert-product-ui-1.4.1.tgz`.
- `vendor/convert-product-ui-1.3.1.tgz` is a stale leftover from the 1.3.1 upgrade. Nothing references it (the 1.3.2 archive was already gone), so it is removed.

## Routes and recipes

Brand Tools has no settings page, no record collection with a detail inspector and no date fields. The recipes that apply are tool pages and card/list collections.

| Route              | Recipe                             | Heading owner | Notes                                                      |
| ------------------ | ---------------------------------- | ------------- | ---------------------------------------------------------- |
| `/`                | Card collection (static)           | page          | Flat cards in a Grid                                       |
| `/colours`         | Card collection                    | page          | Swatch cards, warning alert                                |
| `/typography`      | Content page                       | page          | Cards, table, info alert                                   |
| `/logos`           | Collection with filters            | page          | Control row in the toolbar region; `?asset=` deep link     |
| `/stacks`          | Collection with filters            | page          | Control row in the toolbar region                          |
| `/partners`        | Collection with search and filters | page          | `FilterToolbar` for search; `?q=` deep link; list sections |
| `/create/stack`    | Tool                               | page          | Sticky preview plus control panel; artwork is host-owned   |
| `/create/gradient` | Tool                               | page          | Same layout; WebGL preview is host-owned                   |

Every route uses workspace appearance. No route is left on classic. One `WorkspaceShell` (one `main`) wraps all routes; no page adds a landmark.

## Local CSS that duplicated library styling

| Where                                                        | What                                                            | Action                                                                                         |
| ------------------------------------------------------------ | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `src/components/app-shell.module.css` `.page`                | Outer page padding (16px, 24/32px from 900px)                   | Remove. `PageLayout` owns gutters                                                              |
| `app-shell.module.css` `.shell .cui-workspace-canvas`        | `overflow: clip` so sticky previews work                        | Remove. 1.4.1 sets it on the canvas                                                            |
| `app-shell.module.css` collapsed-rail rules                  | Private-class overrides for the rail identity area and controls | Remove, then re-check collapsed rail geometry                                                  |
| `src/app/globals.css` `.cui-workspace:has(...)`              | Hid the empty sidebar context block                             | Remove. No `context` means no block                                                            |
| `app-shell.tsx` `context=""` `contextDescription=""`         | Empty context props                                             | Remove                                                                                         |
| `guide.module.css` `.swatchCard`, `.assetCard`               | Local card surface, border, radius                              | Replace with `Card elevation="flat"`                                                           |
| `tool-layout.module.css` `.layout`, sticky `.stage`          | Local two-column grid                                           | Kept as a host grid inside `PageLayout` (see outcome: `SplitLayout` stacks the tool at 1024px) |
| `tool-layout.module.css` `.panel`                            | Local card surface for the control panel                        | Kept: sectioned control surface, no library equivalent (see remaining differences)             |
| `guide.module.css` `.filters`, inline grid gaps in libraries | Local control rows and vertical rhythm                          | Move into the `PageLayout` toolbar region; drop inline gaps where `PageLayout` spaces regions  |
| `PageHeader` + `Stack gap={32}` on every page                | Local page header and spacing                                   | Replace with `PageLayout headingOwner="page"`                                                  |
| `toast-provider.tsx`                                         | Random ids, no status                                           | Stable ids from a counter, `status` set; no local timers or styling existed                    |
| Native date inputs                                           | None present                                                    | Nothing to migrate                                                                             |
| Local buttons, borders around toasts, sidebar widths         | None present                                                    | Nothing to remove                                                                              |

Artwork-specific CSS (checkerboards, swatch colours, canvas frame shadow, stack picker, swatch picker) is domain styling and stays.

## Product mark

`WorkspaceShell` gets `productMark` from the Convert icon already published at `/brand/logos/icon-svg-convert-icon-dark-green.svg`. The library contains it at 24px.

## Verification plan

Type-check, lint, unit tests, build, asset check. Then the running app at 1440, 1024 and 390 px, light and dark where the app supports it (Brand Tools is light only), sidebar expanded and collapsed, long content, keyboard paths (sidebar, command search, toast, overlays).

## Outcome

### Migrated and removed

- `app-shell.module.css` deleted: outer page padding, canvas `overflow: clip` and both collapsed-rail overrides. The collapsed rail was re-measured without them: mark, search, expand and the four navigation items sit in normal flow with no overlapping rectangles.
- `globals.css`: the `:has()` rule that hid the empty context block is gone. `context` and `contextDescription` are no longer passed.
- Every page now uses `PageLayout headingOwner="page"` in place of `PageHeader` and `Stack gap={32}`. One `main`, one `h1`, 24px gutters (16px at 390), one divider per region, no horizontal overflow at 390 on all eight routes.
- Colour, logo, stack and partner cards are `Card elevation="flat"`. `.swatchCard` and `.assetCard` keep only the anchor scroll margin and `:target` outline for deep links.
- Filter rows moved into the `PageLayout` toolbar region. Partner search is a `FilterToolbar` with a live result count.
- Toasts use stable counter ids and a `status` (success or error). There was no local toast styling or timer to remove.
- The product mark is the Convert icon in the shell's `productMark` slot.
- `vendor/convert-product-ui-1.3.1.tgz` removed; `vendor/` is ignored and `fetch-product-ui.mjs` pins 1.4.1.

### Remaining differences from the library recipes

1. **Tool pages do not use `SplitLayout`.** Its primary and secondary slots wrap at a fixed 480px + 240px (plus gap). With the sidebar expanded at 1024px the page body is about 730px wide, so the preview stacked above the controls. The tools keep a host grid (preview, 22rem control panel) that stacks below a 680px container.
2. **The tool preview sticks only through a temporary private override.** `.cui-page-body` is `overflow-x: auto` in 1.4.1, which makes the body a scroll container, so `position: sticky` on the preview scrolled away with the page (measured top -662px; 24px with the rule neutralised). `tool-layout.module.css` sets `overflow-x: clip` on that class, scoped to the two tool pages. Remove it when Product UI changes `.cui-page-body` to `overflow-x: clip` (wide tables already have their own labelled scroll region). A docked `CollectionPanel` is also sticky and may be affected; Brand Tools does not use it, so this was not tested.
3. **The control panel is a local surface** (`tool-layout.module.css` `.panel`). `Card` requires a visible heading and the panel is a set of titled sections, so there is no matching public component.
4. **Logos and stacks put plain controls in the toolbar region** rather than `FilterToolbar`, which requires a search field these pages do not have.
5. **No `CollectionPanel`, `DatePicker`, settings navigation or `ConfirmationDialog`.** Brand Tools has no record detail, date fields, settings or destructive actions, so there was nothing to migrate.
6. Native `Select` stays. It is the library default for short lists; `StyledSelect` and `Combobox` are only for icons or search.

### Checks run

See HANDOFF.md for the dated results.
