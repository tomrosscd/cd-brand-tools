# Agency tools review

Reviewed 1 October 2026. Audience: Convert designers and marketing staff working on ecommerce proposals, presentations and campaigns.

## Assessment

The current site is strong at finding approved assets and producing brand backgrounds. Search, copy-to-Figma, original downloads and reproducible composition links already remove useful friction. The next opportunity is to deliver complete starting kits for common jobs, so people spend less time collecting assets and reconstructing the same layout.

The overview cards were visually heavier than their content needed: raised surfaces, a divider and a plain-looking standalone action. The update uses Product UI’s flat Card, a subtle border and an underlined link in the body, without a shadow or footer divider.

## Recommended order

| Priority | Addition                             | Practical use                                                                                 | First useful version                                                                                                                                                            |
| -------- | ------------------------------------ | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1        | Presentation starter kit             | Start proposals, pitches and monthly reports with consistent typography and slide layouts     | Native PowerPoint and/or Google Slides masters: title, section divider, problem/solution, case study, KPI chart, partner lineup and closing slide; matching SVG/PNG backgrounds |
| 2        | AI brand pack                        | Give Claude consistent brand facts and instructions without repeatedly pasting the brand book | Downloadable Markdown guide, colour tokens, approved type rules, asset links and reusable task prompts; dated and versioned                                                     |
| 3        | Task-based asset collections         | Get everything for a proposal, social campaign or partner announcement in one place           | Curated sets linking to the right logo variants, partner assets and background presets; clear format and background guidance                                                    |
| 4        | Shared composition presets           | Reuse good gradient and stack arrangements across a team                                      | Named curated presets with thumbnails and existing share URLs; local favourites first, team saving after authentication                                                         |
| 5        | Accessibility and readability checks | Check whether slide text and campaign copy will remain legible                                | Contrast checker for approved colour pairs; label results for body versus large text; gradient readability requires checking the actual area behind text                        |
| 6        | Campaign export sets                 | Produce matching artwork across channels without rebuilding it                                | Select several canvas presets and export consistently named backgrounds; preview each crop rather than assuming one composition fits every ratio                                |

Presentation templates need approved examples and a decision on PowerPoint versus Google Slides before authoring. Build native masters instead of pretending a PNG background is an editable deck template. Include guidance for font substitution; private font binaries must not enter this public site.

## What the AI pack should contain

- A concise brand facts file generated from the same approved colour and asset data as the site.
- Clear rules separating Convert branding from client and partner brands. Partner logos retain their own brand colours or the supported neutral variants.
- Instructions for slide outlines, campaign briefs, case-study drafts and adapting supplied content across channels.
- Explicit placeholders for client facts, claims, results, audience and offer. No invented performance figures or assumed client voice.
- Worked examples approved by the design and marketing teams, a version date and source links.

Start with an exportable Project knowledge pack and a ready-to-copy instructions file. Claude Projects accept uploaded reference material and project instructions, so this can be useful without connecting an account or building an AI backend. A reusable Claude skill can follow once the team has established repeatable workflows. [Claude Projects documentation](https://support.claude.com/en/articles/9519177-how-can-i-create-and-manage-projects), [Claude brand-guidelines skill example](https://academy.claude.com/use-cases/brand-guidelines-skill).

## Existing tools worth tightening

- Move the creators nearer the top of the overview, grouped as Make something; group the libraries as Find an asset. Validate this with staff’s most frequent tasks before rearranging navigation.
- Add thumbnails and short use-case labels to curated presets, rather than expanding the raw asset-card UI everywhere.
- Make availability explicit: SVG/vector, PNG/image-only, missing partner logo and unverified print values are distinct states.
- Provide an obvious way to report an incorrect or missing asset, with an owner and review date. Choose the team’s actual request channel before adding a form.
- Finish keyboard, mobile and real-browser checks for search, the collapsed rail, sticky previews, copies and downloads. Automated logic/build tests do not cover those interactions.

## Scope and hosting

Keep the next public increment focused on approved agency-wide assets, downloadable templates and brand instructions. Current GitHub Pages hosting is public and has no server-side access control. Client briefs, private results, gated fonts and team-specific saved work belong behind the planned authenticated host, not in a public bundle.

Hosted Claude integration, a generic slide editor and a full campaign-management system are lower priorities. First validate the starter kits with one real proposal and one marketing campaign, then build the smallest tools that remove repeated work.

## Suggested next increment

Build the presentation starter kit and AI brand pack together from one approved example deck and the brand data already in the repository. Link them from the overview and include them in search. Measure whether staff can create a correctly branded first draft without manually collecting assets or pasting brand instructions.
