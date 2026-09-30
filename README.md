# Convert Brand Tools

An internal application for the Convert brand: a brand guide, an asset library with approved downloads, a stack image creator and a brand gradient generator.

The interface is built on [Convert Product UI](https://github.com/tomrosscd/cd-product-ui), pinned to an exact release. The tools, brand data and hosted brand assets live here.

## Run locally

Requires Node 22.22.2 or later, pnpm, and the GitHub CLI authenticated with an account that can read `tomrosscd/cd-product-ui`.

```sh
pnpm product-ui
pnpm install
pnpm dev
```

`pnpm product-ui` downloads the pinned Product UI 1.3.1 archive into the ignored `vendor/` directory and verifies its SHA-256 checksum. Run it before installing dependencies on a fresh checkout. The private package archive is never committed.

`pnpm dev` and `pnpm build` first run `pnpm assets`, which publishes the supplied originals from `assets/source` into `public/brand` and regenerates the manifests in `src/brand`.

Open http://localhost:3000.

## Hosting

`main` deploys to GitHub Pages at https://tomrosscd.github.io/cd-brand-tools/ through `.github/workflows/pages.yml`. The site is a static export (`output: 'export'`), so it has no server. To preview the Pages build locally:

```sh
NEXT_PUBLIC_BASE_PATH=/cd-brand-tools pnpm build
```

Both GitHub workflows fetch Product UI before installing dependencies. Set the repository Actions secret `PRODUCT_UI_TOKEN` to a read-only token with access to `tomrosscd/cd-product-ui` (Contents: read). The default `GITHUB_TOKEN` cannot read that separate private repository.

The output is in `out/`. GitHub Pages sites are public. Do not add fonts or gated assets until access control exists on a different host.

## Checks

```sh
pnpm check
```

Runs the asset manifest check, type-check, lint, unit tests and a production build.

## Documents

- [Project plan](docs/PLAN.md): phases, architecture, presets and open decisions
- [Handoff](HANDOFF.md): current state and next steps
- [Contribution rules](AGENTS.md)
- [Original Brand Hub brief and plan](docs/history/)

## Status

Phase 1 built and hosted publicly on GitHub Pages. No authentication: only already-public brand assets are included.
