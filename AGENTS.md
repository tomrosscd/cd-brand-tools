# Convert Brand Tools: contribution rules

Read HANDOFF.md at the start of each task and update it at meaningful checkpoints and before stopping. Read docs/PLAN.md before starting new work. The approved brief of 8 September 2026 is in docs/history/BRIEF.md.

## Boundaries

- This repository owns the brand tools, brand data and hosted brand assets. `@convert/product-ui` is a pinned dependency for the interface. Reusable component gaps become a reviewed Product UI change, not a local fork of a component.
- Upgrade Product UI with an exact version in its own change, with a visual and interaction review.

## Brand rules

- `src/brand/colours.ts` is the only source of brand colour values. Tools offer only these colours.
- Brand colours are not interface tokens. Style the interface with Product UI `--cui-*` variables.
- Never edit files in `assets/source`. Run `pnpm assets` and `pnpm stacks` to regenerate published files and manifests.
- Preserve artwork geometry. Transform a whole stack or logo; never reshape or reposition its parts. One colour per stack. One stack per composition.
- Do not silently recolour official download files.
- Roobert with Geist fallback for the interface. The brand serif appears only in brand examples and exported artwork.
- Do not add AI image generation, text editing, shape deformation or a CMS without scope approval.
- Never commit font binaries, credentials or gated assets while the repository is public.

## Interface

- Australian English. No em dashes in interface copy.
- Every drag interaction has a keyboard alternative. Visible focus, visible labels, clear selection states, useful export feedback.
- Tool state is a plain serialisable object. Preview and export both render from it.

## Code

- Strict TypeScript, named exports, kebab-case filenames, single quotes, no semicolons. Run `pnpm format`.
- Framework-free logic lives in `src/lib` with Vitest coverage.
- Run `pnpm check` before opening a pull request. Record what actually passed in HANDOFF.md.
- Focused branches and reviewed pull requests. Do not push to `main` directly after the initial commit.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
