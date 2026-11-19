# PromoProof 2.1 verification report

Verified locally on 17 November 2026. No application files were published or uploaded. All browser examples and retained exports are synthetic.

## Automated and preservation checks

- `npm test`: **42 passed, 0 failed** after the final UI change.
- `npm run build`: production build succeeded; scripts, styles and fonts are inlined into one HTML file.
- `node scripts/verify-package.mjs`: passed; **636,105 bytes**, eight embedded assets, no external script or stylesheet dependency.
- SHA-256 comparisons: `finance.mjs`, `decision.mjs`, `storage.mjs` and `exports.mjs` match their pre-redesign versions byte for byte. Evidence is included in `qa/core-hashes-verified.json`.
- Existing tests cover financial rounding, positive/zero/negative contribution, inventory caps, fees, target thresholds, maximum discounts, validation, v1 migration, frozen reviews, import remapping and CSV escaping.

## Browser workflow checks

The app was exercised through the in-app browser using real controls and downloaded files, against the final standalone build served on loopback. DOM inspection was read-only; scenarios and actuals were entered through the interface.

| Workflow | Observed result |
| --- | --- |
| Home, example and new analysis | Home explains the product; the example opens a working three-scenario plan. A blank analysis follows baseline, goal and offer sections. |
| Dedicated guide | How It Works has a separate hash route, survives reload, and includes steps, a worked example, result definitions and saving/review instructions. In-page links and disclosures work. |
| Validation and progressive inputs | Missing or invalid values show field-specific links that open the relevant section. The plan-input anchor keeps the analysis workspace visible. |
| Goal and costs | Protect-profits and clearance goals update the decision immediately. Per-unit fulfillment, other variable costs, percentage fees, inventory and campaign expenses affect the correct outputs. |
| Live chart | Case buttons, slider and numeric exploration update the chart result. Exploring 163 and 164 units crosses the sample goal correctly without changing the planned 180-unit assumption. |
| Comparison | All three sales assumptions and chart metrics work. The table's selected-case column agrees with its selector. Case and metric selections persist after opening a scenario and returning. |
| Scenario actions | Create, duplicate and deletion confirmation work. Deleting a temporary test scenario preserves the remaining scenario. |
| Financial details | Headline indicators open the detailed calculation section. Maximum discounts and unattainable targets remain explicit. |
| Saving | Save and reopen persist the analysis, scenarios and review. Reloading Home preserves the saved library. Unsaved-work confirmation is shown before replacing the active plan. |
| JSON export and import | Exported analysis contains three scenarios and one review. Import adds an independent copy, preserving the frozen plan and actual values. Library backup downloads successfully. |
| CSV exports | Scenario CSV has nine scenario/case rows; review CSV has six metric rows. Downloaded contents reconcile to the visible results. |
| Actual-results review | Blank actuals remain unknown. Entered actual revenue, costs, fees and campaign expenses reconcile to contribution profit. Editing the live plan does not change the frozen review plan. |
| Keyboard | Analysis tabs respond to arrow keys. Fields have labels and visible focus styling. This is a focused keyboard check, not a full assistive-technology audit. |
| Responsive layout | Desktop 1488 × 1058, current/default viewport, tablet 768 × 1024 and phone 390 × 844 were checked. No outer horizontal overflow in the checked screens; wide tables scroll within their own containers. |
| Browser errors | No application console errors or warnings were observed during the final chart verification. |

## Financial examples checked in the UI

### Canvas tote: protect normal profit

Regular price $50, unit cost $22, normal sales 100, stock 220, discount 20%, campaign expenses $150, and conservative/expected/optimistic sales of 140/180/220.

| Result | Expected value |
| --- | ---: |
| Normal contribution profit | $2,800 |
| Conservative contribution profit | $2,370 |
| Expected contribution profit | $3,090 |
| Optimistic contribution profit | $3,810 |
| Expected change vs normal | +$290 |
| Sales needed to meet goal | 164 units |
| Campaign cost break-even | 9 units |
| Maximum goal-sustaining discount at 180 sales | 23.23% |
| Profit at 163 / 164 units | $2,784 / $2,802 |

Expected sales meet the goal, but the conservative case misses it. The decision therefore retains a risk indicator.

Adding $3 fulfillment and $0.30 other variable cost per unit, plus a 2.9% selling fee, produces $2,287.20 expected contribution, $2,325 normal contribution, a -$37.80 change, a 183-unit goal threshold and a 19.57% discount ceiling.

### Seasonal mug: clearance with a loss budget

Price $10, unit cost $8, normal sales 20, stock 100, discount 30%, campaign expenses $70, 60% sell-through goal and a $150 loss budget. Sales assumptions 60/70/100 yield contribution profits of -$130/-$140/-$170. Expected sales meet the clearance goal, but optimistic sales breach the loss budget because each additional unit loses money.

At a 20% discount, unit contribution is zero: more sales cannot recover the $70 campaign cost. With campaign expenses raised to $1,000, even full price cannot meet the loss target within stock; the interface reports the goal as unattainable instead of inventing an infinite or negative sales target.

### Frozen post-promotion review

The original tote plan forecasts $3,090. Entered actuals: 175 units, $7,000 revenue, $3,850 variable costs, $203 selling fees and $170 campaign expenses. Actual contribution is **$2,777**, **-$313 vs plan** and **-$23 vs the normal baseline**. Changing the live planning costs leaves the frozen $3,090 plan unchanged. JSON export/import retains these values.

## Fixes found through browser QA

- Plan and guide anchors no longer replace the analysis route accidentally.
- Validation links name and reveal the actual invalid field.
- Comparison case and metric stay selected when navigating into an offer and back.
- Zero-profit comparison bars no longer suggest a nonzero value through a minimum bar width.
- Mobile library overflow was fixed by containing the visually hidden table header in its scroll container.
- SVG chart dimensions now follow the available container width; tablet and phone labels remain readable instead of shrinking with a desktop-sized viewBox. The final tablet chart uses a 384 × 270 viewBox and the phone chart a 324 × 270 viewBox.

## Verification limits

- **Native Print/PDF preview was not verified.** Calling print in the in-app browser stalled that test tab; closing it restored interaction. A separate Chrome app-access request timed out. The existing Print/PDF action remains available, but this report does not claim that a native PDF was produced or visually approved.
- **Direct `file://` launch was not browser-tested.** The environment disallows that navigation. The same self-contained HTML was structurally verified and tested over a local HTTP preview. Browser storage behavior for local files varies; the README recommends keeping the file in a stable location and using JSON backups when moving it.
- Browser checks used the available Chromium-based in-app browser. Firefox and Safari were not separately exercised.
- Vendor research used public pages and documentation, with no authenticated dashboard access.

## Evidence

The delivery includes desktop and mobile screenshots for Home, Decision, comparison, review and How It Works; a tablet Decision screenshot; the native-size desktop viewport; three concept references; core hashes; and valid JSON/CSV samples. See `FIDELITY-v2.1.md` for the separate visual comparison. Screenshots show local synthetic saved records; those records are not preloaded into the delivered app.
