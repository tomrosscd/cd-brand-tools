# Delivery plan

## Recommended order

1. Complete a focused Product UI foundation update: official brand components and documentation, reusable action menus and feedback controls where needed, and accurate validation records.
2. Establish the Brand Hub application as the first real internal-tool consumer of a pinned Product UI version.
3. Build the guide, asset browsing and creator locally without authentication. Add employee/invite access and protected downloads in phase 2, before distributing private resources.
4. Build and verify the stack creator.
5. Add further Product UI components driven by actual application needs. Deliver Product UI dark mode as a separate reviewed theme update.

The Brand Hub should not wait for every proposed Product UI component or dark mode. Its functioning application provides the internal-view test case; avoid building a duplicate full admin application just to demonstrate the same controls.

## Phase 0: planning and asset audit

Inputs: supplied Confluence Brand Assets PDF (Google Templates excluded), any further brand guidelines, font files and remaining composition decisions.

Deliverables: asset manifest, approved palette and print values, access matrix, navigation outline, creator interaction specification and chosen application/authentication approach. Preserve supplied source archives and record asset provenance.

Exit: unresolved choices are settled and Tom authorises implementation.

## Phase 1A: application and brand essentials

Create a standalone application using a pinned Product UI release. Choose an application framework that can accommodate later Google sign-in and protected downloads. Authentication implementation is deferred to phase 2. Do not assume a static-only public deployment will meet those needs.

Build brand essentials, colour copying, typography guidance, asset previews and approved logo downloads. Keep phase 1 local and exclude private font distribution until phase 2. Keep approved brand data centralised; do not create a second independently edited copy of shared palette values. Brand-specific print metadata and marketing typography should stay distinct from product UI semantic tokens.

Verify responsive layouts, keyboard navigation, copy feedback and correct download files. Access-boundary checks belong to phase 2.

## Phase 1B: stack creator

Use vector composition based on the supplied SVG artwork. This is an SVG editing tool, not an AI image-generation service. Keep composition state independent of the editor interface and generate exports from that state.

Build motif selection, one brand colour control for the entire stack, frame presets/custom size, move/scale controls, asset placement, stack-only randomisation, reset/undo and exports. Rotation and flipping require a scope decision before inclusion.

Verify edge cropping, transparency, SVG element identifier collisions, exported aspect ratio and pixel dimensions, representative rendering across all 36 stacks, SVG/PNG/JPEG visual agreement, and export size/error handling. Preserve original source geometry. JPEG export must resolve a background explicitly when the composition is transparent.

## Phase 2

Add Google company sign-in, invited-user access, resource gating, protected font downloads, saved presets and curated starting compositions. Verify both routes and direct asset access for anonymous, invited and employee users. Decide later whether presets are downloadable files, local saves or account-backed records. Do not introduce a database for saved compositions in phase 1 unless another approved requirement needs one.

## Phase 3: richer artwork

Add uploaded-image masking through the unchanged stack silhouette. Specify image positioning within the mask and portable export behaviour when this phase is designed. Add the “Commerce That Stacks Up” tagline lockup once supplied. Do not assume text editing or arbitrary shape editing is included.

## Timeline

This is an ordered delivery sequence, not a dated commitment: Product UI foundations, Brand Hub phase 1A, phase 1B, phase 2 access/presets, then phase 3 masking/additional assets. Product UI dark mode and remaining controls can proceed independently after foundations. Estimate calendar dates once build scope and availability are agreed.

## Git and releases

Use a separate Brand Hub repository. Work on focused feature branches, keep commits scoped, run relevant checks and review changes before merging. Publish application releases independently from Product UI releases. Update the pinned library version in a dedicated change with a visual and interaction review. Never use floating dependency versions for adoption examples.

No remote repository, deployments, authentication subscriptions or application code are created as part of this planning delivery.
