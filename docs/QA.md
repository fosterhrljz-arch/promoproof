# PromoProof v1 verification

## Calculation and data checks

`npm test`: 15 tests passed. Coverage includes the known $2,800/$3,090/+290/164-unit example, whole-unit ceiling boundaries, no discount, zero margin, negative margin, 100% discount, zero volume, negative baselines, expense recovery, exact-cent arithmetic, half-up selling-price rounding, upper bounds, invalid inputs, backup validation, and CSV formula injection protection. A representative grid checks the threshold inequality across 480 configurations, including the adjacent failing whole-unit volume.

`npm run build`: passed. Vite emits a static build and the post-build script embeds JS, CSS, and fonts in `dist/index.html`. All business calculations and persistence run in the browser.

## Browser checks

Method: built-in in-app browser through CUA, using accessible locators, DOM/AX snapshots, read-only layout measurements, console checks, and JPEG screenshots. No Playwright fallback was needed. The first sandboxed preview was inaccessible; an approved loopback-only server outside the sandbox resolved this. Final static build checked at `http://127.0.0.1:5185/`.

Verified flows:

- Home renders and its example action opens the analysis workspace.
- The sample displays $3,090 contribution profit, +$290 / +10.4%, and 164 units required.
- Editing discount to 56% shows zero unit contribution, −$150 promo profit, and an unreachable baseline target. At 100%, it shows −$4,110, a warning that each sale adds a loss, and no invented sales target.
- Comparison shows all sample scenarios, including the $2,890 / +$90 alternative and $2,450 / −$350 deeper discount.
- Creating a fourth scenario at 25% discount and 210 units produces $3,105 / +$305 with a 191-unit threshold.
- Save, reload, and reopen retain all four scenarios.
- CSV and JSON files download successfully. File contents were inspected: four scenarios, correct inputs and computed values, valid versioned JSON.
- Re-importing that JSON adds a separate analysis with all four scenarios, preserving existing work.
- Desktop 1536×1024 and phone 390×844 layouts were checked. After fixes, document scroll width equals viewport client width. Wide comparison tables remain intentionally scrollable inside their panels.
- Final production home and sample workspace render without relevant console warnings/errors or framework overlays.
- Blank required inputs suppress computed results; attempting to save shows field-level feedback and a notification. The help dialog opens and explains the model and assumptions.

Verification limits: the browser security policy prohibits direct `file://` navigation, so double-click launch of the self-contained artifact was not exercised. The identical artifact was successfully tested over HTTP. The operating system’s print dialog / PDF writer was not exercised; the app exposes browser print with a dedicated print stylesheet. No claims are made about every browser or all print drivers.

## Visual fidelity review

Concepts: `concept-home.png`, `concept-analysis.png`. Both were inspected with `view_image`, as were the final home, analysis, comparison, and mobile screenshots. Native concept viewport 1536×1024 was used; full-page captures additionally show the continuation.

| Comparison point | Observation and resolution |
| --- | --- |
| Composition | Preserved two-column home, steps, saved list; analysis form rail, verdict, metric columns, chart, and breakdown. |
| Typography | Bundled Inter. Increased initially undersized headings, labels, and result numbers; preserved editorial hierarchy. |
| Palette | True-white panels, cool-gray page, dark teal actions, mint positives, coral/red negatives. No decorative gradients. |
| Chart anatomy | Preserved rising profit line, dashed normal-profit baseline, crossover, forecast point, and highlighted attainable-profit region. Replaced awkward fractional axis ticks with readable intervals. |
| Spacing | Removed an oversized chart and consolidated desktop scenario controls into the tab row. Used consistent panel and control spacing. |
| Icons and assets | Native P brand mark and consistent outlined Lucide controls. No bitmap asset substituted for real controls. |
| Responsive behavior | Form and results stack on phones; chart has a dedicated mobile coordinate system. Fixed grid minimum widths and an absolutely positioned screen-reader label that caused page overflow. |
| Copy | Primary home/analysis headings, CTAs, and chart/breakdown titles retain concept intent. “Save scenario” becomes “Save analysis” to describe saving the whole comparison. |

Intentional concept extensions: editable analysis/scenario names, currency and period, precise full-range discount control, scenario selector, keyboard-operable chart probe, truthful unsaved status, real empty-library state, and detailed assumptions. These require a taller workspace than the illustrative compact concept. Fake saved rows were not seeded as user data. Remaining differences are documented product behavior rather than unresolved clipping or broken controls. The implementation was visually checked against the concept’s composition and design system; it is not claimed to be pixel-identical to the raster concept.

Final screenshot artifacts: `home-desktop.jpg`, `analysis-desktop.jpg`, `comparison-desktop.jpg`, `home-mobile.jpg`, and `analysis-mobile.jpg`.

## Delivery state

The working static preview and standalone ZIP are complete. The user explicitly approved uploading the app source, build, documentation, and synthetic sample screenshots to the specified owner-only Site. Access was rechecked before publication; no entered business data is part of the upload. The final deployment status and URL are reported in the delivery response.
