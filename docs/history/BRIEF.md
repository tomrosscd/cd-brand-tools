# Approved brief

## Purpose

Give staff and invited collaborators a simple place to understand the Convert brand, download approved assets and create branded background images for presentations and other formats.

## Access

Google company sign-in is the preferred eventual access method, with invited users also supported. All authentication and gating are deferred to phase 2. Phase 1 is an ungated local prototype; this is not authorisation to publish private fonts or the creator publicly. Decide the public/private content split and invitation process before wider deployment.

Protected assets must be authorised when requested, not merely hidden in navigation. Private font files must not ship in a public application bundle or public Storybook.

## Brand guide and downloads

- All variations in the supplied logo archive are current.
- Preview and download logos, symbols and profile icons, with clear format and colour labels.
- Show copyable HEX, RGB and approved CMYK values from a shared brand data source.
- Use the supplied Confluence Brand Assets PDF and subsequent brand guidelines as the source for print values and usage rules. Ignore the Google Templates section entirely. Do not invent CMYK values.
- Offer approved font downloads to authorised people. The PDF names Denton x Condensed as the sparse-use heading serif, Darker Grotesque as the Roobert Google alternative, and Instrument Serif as the Denton Google alternative. Font binaries still need to be supplied. Protected font distribution follows access control in phase 2.
- Keep Roobert with Geist fallback for the application interface, following Product UI.

## Stack creator, phase 1

- One supplied stack per image, chosen from the 36 SVG motifs.
- Preserve stack geometry. Do not reshape or independently reposition its constituent shapes.
- Apply one selected approved brand colour to the entire stack. No per-shape colour controls.
- Move and scale the stack, including beyond the frame so the export crops it.
- Randomise changes only the selected stack, preserving the other settings where feasible.
- Allow additional approved Convert assets to be placed in the composition. Exact asset choices and placement controls remain to be confirmed.
- Choose an aspect ratio, a preset or custom pixel dimensions.
- Presets should cover widescreen decks, square graphics, LinkedIn banners and desktop wallpaper. Exact dimensions will be confirmed during implementation.
- Export SVG, PNG and JPEG. SVG and PNG support a transparent background; JPEG requires a solid background.
- Choose a solid background from the approved brand colours or turn it off for compatible formats.
- Support sensible higher-resolution exports with explicit size limits established through testing.
- Editable text is not yet approved scope.

## Later scope

Phase 2 adds Google company sign-in, invitations, gated resources, saved presets and curated starting compositions. Phase 3 adds use of a stack as a mask for an uploaded image and additional supplied assets such as the “Commerce That Stacks Up” tagline lockup. Image masking must preserve the stack geometry. No content management system, upload administration screen or shared design gallery is required for phase 1. Tom maintains content and assets through the repository.

## Interface quality

Use Convert Product UI for the application shell and controls. Use Australian English and no em dashes in interface copy. Provide keyboard-operable alternatives to dragging, clear selection states, visible focus, accessible labels and useful export feedback. Keep client data and business logic out of the component library.
