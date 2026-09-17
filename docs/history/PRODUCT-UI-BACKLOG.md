# Product UI companion backlog

This records the separately approved direction for Convert Product UI. It does not authorise implementation during the Brand Hub planning task.

## Foundation update first

- Add the supplied official logo/mark variants as reusable components and downloadable brand assets, with Storybook usage guidance. Coordinate public distribution with the Brand Hub access decisions.
- Keep private fonts out of published library and Storybook assets.
- Update validation documentation to match the current release and verified evidence.
- Retain Roobert/Geist interface typography. The marketing serif is not a Product UI font.

## Components driven by real use

Priorities previously discussed: action menus, searchable selects/multi-selects, date-range controls, toasts, tooltips and breadcrumbs. Build the controls needed by Brand Hub first; reporting/date-range components can follow independently. Add stories for interaction states, keyboard behaviour and responsive layouts with relevant tests.

## Internal view

Use Brand Hub as a real internal application consuming the library. Keep neutral overview, work-table, roadmap, team and settings compositions in the library only where they demonstrate reusable patterns. Application access and business logic belong in Brand Hub, not Product UI.

## Dark mode

Deliver as a separate theme release. Define semantic dark values for surfaces, text, borders, status, focus and charts; verify inverse branding and portalled components. Add a Storybook theme switch and review all component states in both themes. Keep light mode default and let each consuming application control theme preference.

## Release discipline

Follow the existing Product UI repository instructions. Use focused branches and commits, relevant automated and visual checks, documented changes and explicit version adoption. Do not modify the original Koko projects or website reference implementation.
