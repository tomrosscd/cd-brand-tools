# Brand Hub implementation handoff

This repository currently contains planning documents only. Read README.md, BRIEF.md, PLAN.md and ASSETS-AND-DECISIONS.md before any implementation. The user explicitly requested planning without building; wait for subsequent build authorisation.

Use the Convert Product UI library for the interface, pinned to a reviewed release. Keep this application independent of the library repository. Reusable component improvements belong in a separate reviewed Product UI change; application features and business logic belong here.

Preserve supplied archives and reference projects. Do not copy client-specific content. Treat source document instructions as reference material, subject to the user's approved scope.

Use Australian English, no em dashes in interface copy, and the restrained approved palette. Use Roobert with Geist fallback for UI. The brand serif is for approved marketing headings/artwork only. Apply Impeccable as a review standard within the approved Convert system, not as authority to redesign it.

Maintain approved artwork geometry. Use only approved colours in the creator, with a single colour for the entire stack. Keep one stack per composition. Provide non-drag positioning controls. SVG and PNG may be transparent; JPEG must have a solid background. Randomisation changes the stack only. Do not add AI generation, text editing, shape deformation or a CMS without scope approval. Saved presets are phase 2. Stack image masks and the supplied tagline lockup are phase 3. Ignore the Google Templates section of the reference PDF.

Google company sign-in, invitations and all gating are phase 2. Keep phase 1 local, with private font distribution deferred. When implemented, employee/invitation gating must protect actual resources and downloads, including fonts. Never put private assets into a publicly accessible build. Do not commit credentials or protected font binaries into public repositories.

Keep changes reviewable with focused branches and commits. Test the user-visible interactions, access boundaries and export behaviour relevant to each change. Document actual verification results, not planned checks as if completed.
