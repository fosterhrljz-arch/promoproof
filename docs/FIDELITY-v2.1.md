# PromoProof 2.1 visual fidelity ledger

Reviewed 17 November 2026. The user authorized independent design decisions using the three public analytics references. Generated concepts are implementation guides, not vendor interface copies or user-approved pixel specifications.

## Evidence and method

- Concepts: delivery `qa/concept-home.png`, `qa/concept-analysis.png`, `qa/concept-guide.png`.
- Local working concept directory: `C:\Users\TTK\Documents\ChatGPT\Session\promoproof-v2.1-qa`.
- Renders: delivery `screenshots/`, captured with the in-app browser's native screenshot API. Full-page images show page continuation; `decision-preview.jpg` preserves the opening viewport.
- The accepted working concepts and latest implementation screenshots were opened with `view_image` in the same QA pass. The final chart revision was compared again against the analysis concept and desktop, tablet and mobile renders.
- Concept-size viewport: **1488 × 1058**. Also checked the default preview, **768 × 1024** tablet and **390 × 844** phone.

## Concrete comparison points

| Area | Concept evidence | Render evidence | Resolution |
| --- | --- | --- | --- |
| Home hierarchy and copy | `concept-home.png`: large product promise, start/example actions, worked result, workflow strip and analysis library | `home-desktop.jpg`, `home-mobile.jpg` | Preserved. The guide link uses a separate line so the actions remain clear at narrow widths. Saved rows reflect real local state. |
| Global navigation | All concepts: white left rail with Home, Analysis and How It Works | All desktop screenshots | Preserved with a 208px rail and consistent outline icons. At narrow widths it becomes a compact top navigation. The guide correctly highlights How It Works instead of the concept's mistaken Home selection. |
| Workspace structure | `concept-analysis.png`: input rail, scenario selector, decision first, four metrics, chart, rules and detailed disclosure | `decision-desktop.jpg`, `decision-preview.jpg` | Preserved. Live controls have more breathing room; rules continue below the opening viewport rather than being squeezed into it. |
| Typography and controls | Concepts use a neutral sans serif and a strong title/metric hierarchy | All screenshots; computed control and chart styles checked | Bundled Inter, explicit control sizes, 28px analysis titles, clear metric values and quieter helper text. Deliberately cleaner and less heavy than raster text in the concepts. |
| Palette and surfaces | Concepts use a cool neutral canvas, white panels and blue actions; semantic amber for caution | Desktop and mobile renders | Locked to the documented tokens: #f5f6f8 canvas, white surfaces, #365de3 blue, fine borders and restrained radius/shadow. No decorative hero gradients or image overlays. |
| Chart accuracy and readability | `concept-analysis.png` shows an illustrative bent line beginning above zero | Final Decision screenshots | Intentional correction: the actual contribution function is linear and starts at -$150 with zero sales. Goal line, sales assumptions, keyboard-accessible controls and exact exploration output use the existing engine. Container-aware SVG sizing fixes tablet label shrinkage. |
| Guide content and structure | `concept-guide.png`: introduction, steps, worked example and definitions | `how-it-works-desktop.jpg`, `how-it-works-mobile.jpg` | Preserved and expanded with practical success indicators and review/save instructions. Distinguishes nine-unit campaign break-even from the 164-unit normal-profit target. |
| Comparison and review | Required downstream states extend the same rail/tabs/panel/table system | `comparison-desktop.jpg`, `comparison-mobile.jpg`, `review-desktop.jpg`, `review-mobile.jpg` | Real charts, filters, frozen plans and actual input controls. No decorative or inert dashboard placeholders. |
| Mobile spacing and overflow | Mobile continuation is specified in `DESIGN-v2.1.md` | All mobile screenshots | Decision appears before progressive inputs. Tables scroll inside their panels. A library header-positioning overflow was repaired and rechecked. No outer overflow remains in checked screens. |
| Icons and assets | Concepts use simple outline navigation and action symbols | Sidebar, tabs, save/export, rules and disclosures | Consistent Lucide outline icons and a native text brand mark. No raster concept is used as functional UI; all charts, labels, controls and tables are native code. |

## Above-the-fold copy diff

Compared the content inventory in `DESIGN-v2.1.md` with the rendered Home, Analysis and How It Works opening views.

- Home keeps the inventoried headline, product description, Create analysis, Explore example, guide link, synthetic tote result and three-step strip. The saved-analysis count and rows come from local state.
- Analysis keeps the title/context, Save analysis, Export, Decision / Compare scenarios / Review actuals, scenario selector and three progressive sections.
- Decision wording intentionally comes from the existing rule engine: “Works at expected sales. Risk remains.” and “Needs a check” replace the generated concept's simplified language.
- Financial labels are made explicit: “Change vs normal”, “Sales needed for goal” and “Maximum discount” replace shorter mockup labels. Context such as “After fees & campaign costs” prevents ambiguous interpretation.
- The existing **30-day period** replaces the concept's illustrative seven-day period. The live saved analysis name replaces the mock title.
- Assumption disclosures, saved status, review counts and validation messages are functional additions required to distinguish user input, actual results and temporary chart exploration.
- No testimonials, adoption statistics, forecast claims or marketing badges were invented.

All copy differences are deliberate and recorded above. No unexplained above-the-fold additions remain.

## Signoff assessment

The implementation was faithfully checked against the working visual direction for copy, layout, typography, palette, spacing, container structure, icons and responsive behavior. The material issues found during review—mobile library overflow and chart label scaling—were repaired and the affected screenshots recaptured. No material visual mismatch remains in the checked states. Remaining deviations improve financial accuracy, preserve working behavior or make the tutorial readable; they are documented rather than hidden. This assessment is separate from the functional checks and browser limitations in `QA-v2.1.md`.
