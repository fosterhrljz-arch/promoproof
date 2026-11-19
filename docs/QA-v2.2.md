# PromoProof v2.2 — verification record

Verification date: 2026-11-17. All example figures are synthetic. This record describes checks actually completed; historical v2.1 notes are not evidence for a new test.

## Automated checks

- `npm test`: **50 passed, 0 failed** (42 retained tests and 8 v2.2 guidance/report tests).
- `npm run build`: passed with Vite 7.3.8; standalone output created.
- `node scripts/verify-package.mjs`: passed; embedded CSS/fonts and no external script or stylesheet references.
- SHA-256 comparison: `src/finance.mjs`, `src/decision.mjs`, `src/storage.mjs`, and `src/exports.mjs` exactly match the pre-v2.2 copies. Their hashes are in `core-hashes.json`.
- The package validator now inspects CSS style blocks, avoiding a false failure caused by a `url(...)` string inside bundled PDF JavaScript.
- Dependency audit after updating the existing Vite dependency reported zero vulnerabilities. This is a point-in-time result.

Coverage includes integer-cent arithmetic, half-up fee/price rounding, inventory caps, positive/zero/negative contribution thresholds, exact discount ceilings, invalid inputs, loss-limited clearance, immutable review snapshots, actual reconciliation, migration, storage validation, CSV formula injection, guidance feasibility, goal-aware comparison selection, and embedded-font PDF generation.

## Browser workflow

Production build served locally, using the in-app Chromium browser:

1. Home and the worked example open; all content is in English. Homepage explicitly says “could earn” and labels assumptions as not forecasts.
2. Created and saved the tote analysis; duplicated an offer into a fourth 5% option with 115 / 130 / 150 assumed units and $100 expenses.
3. Decision guidance reconciles the 20% offer's $430 conservative shortfall, 24 extra units, $290 expected buffer, 164-unit target, and 23.23% expected-volume discount ceiling.
4. Comparison displays one fully passing offer, three expected-case qualifiers, and one expected failure. Switching sales case and metric works; settings survive switching workspace views.
5. Froze the 20% plan; blank actual inputs remain unknown. Entered 175 units, $7,000 revenue, $3,850 variable costs, $203 selling fees and $170 campaign expenses. Actual contribution is $2,777; variance is −$313 and the normal-baseline difference is −$23.
6. Saved the review, exported JSON, and imported it through the real file chooser into a clean browser origin. Reloading and reopening retains four scenarios and the completed review with $2,777 actual contribution.
7. Downloaded scenario CSV, review CSV, JSON and PDF through the app. Scenario CSV has 12 rows (four scenarios × three cases); review CSV has six metric rows. Values reconcile to the workspace.
8. How It Works displays the actual v2.2 decision, comparison and review screenshots. All three tour buttons work; screenshot enlargement opens and closes; image loads were checked.
9. Guidance's “Review offer & sales” action opens the offer section and exposes its inputs.
10. Print report preview includes baseline, comparison, all four offers, frozen actual review and model notes. Returning to the workspace preserves the analysis.
11. Desktop captures include 1488 × 1058 and 1280 × 720 viewports. At 390px viewport width, guide, decision, comparison and review have no page-wide horizontal overflow. Decision and review also fit a 320px viewport; wide data tables scroll within their containers.
12. No browser console warnings/errors were captured during this final workflow.

## PDF validation

The direct download is a valid six-page A4 PDF. All six pages were rendered and visually inspected: no clipped text or overlapping table cells was found. Extracted text includes $2,777.00 actual contribution, −$313 variance and the 23.23% ceiling. The PDF distinguishes planned assumptions from user-entered actuals, includes all four scenarios and review, and labels contribution as excluding fixed overhead and tax.

The compact embedded font intentionally rejects unsupported name characters with an explicit instruction to use browser printing. English/Latin and supported currency output are tested. No claim of universal script support is made.

## Verification boundary

**Direct Windows double-click launch and the native print dialog are not certified by this run.** Computer control stopped when it could not reliably verify the native browser address. No attempt was made to bypass that safety check. The identical standalone artifact passed structural checks and the HTTP browser workflow. Direct PDF generation and the browser report preview are verified; native paper printing and the browser's Save as PDF dialog remain an environment-specific manual check.

A beginner can perform the outstanding check by extracting the ZIP, opening PromoProof.html in Edge or Chrome, choosing Explore example, then using Export → Print report → Print report. Success means the example calculates $3,090 and the browser preview includes the report without clipping.

## Screenshot evidence

All current screenshots live under `docs/screenshots/`. The four README image paths are relative, verified to exist, and contain readable JPEG files. They show the actual application; no generated mockup is presented as a product screenshot. Earlier concept images elsewhere in docs are historical design records only.
