# Convert Brand Tools

An internal application for the Convert brand: a brand guide, an asset library with approved downloads, a stack image creator and a brand gradient generator.

The interface is built on [Convert Product UI](https://github.com/tomrosscd/cd-product-ui), pinned to an exact release. The tools, brand data and hosted brand assets live here.

## Run locally

```sh
pnpm install
pnpm dev
```

`pnpm dev` and `pnpm build` first run `pnpm assets`, which publishes the supplied originals from `assets/source` into `public/brand` and regenerates the manifests in `src/brand`.

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

Phase 0 complete. Phase 1 in progress. No authentication: run locally only, and do not deploy publicly until phase 2 access control exists.
