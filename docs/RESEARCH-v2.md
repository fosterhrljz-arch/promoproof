# Research informing PromoProof 2.0

Reviewed public product pages in November 2026. These are vendor-described features and visible public interaction patterns, not an audit of paid products. No account, purchase, private customer data, or proprietary interface was used. PromoProof keeps its original visual system.

| Reference | Observed business logic and interaction | Adaptation in PromoProof |
| --- | --- | --- |
| [SmallBizMath Discount Profit Calculator](https://smallbizmath.com/promotions/discount-profit-calculator/) | Separates unit cost, percentage/fixed fees and shipping. Shows contribution, required volume uplift, and the discount ceiling; advanced inputs and formulas remain inspectable. It explicitly says uplift is not demand prediction and a zero-contribution ceiling is not a recommended offer. | Progressive cost disclosure, fee-aware contribution, explainable thresholds. Our ceiling additionally covers the campaign budget and the selected business goal at a specified volume. |
| [Merchant Sheets Promo & Discount ROI Calculator](https://merchantsheets.com/products/promo-discount-roi-calculator/) | Distinguishes baseline from promotion activity; subtracts fulfillment and ad spend; uses a calculator, scorecard and individual promotion review. Public instructions describe user-set minimum ROI, break-even lift, actual promotion inputs and performance tiers. | Shared baseline, goal-aware comparison, and a frozen plan against manually entered actual totals. We use transparent goal rules rather than importing its ROI tiers or implying causal lift from a simple before/after comparison. |
| [Yieldigo Promotion Analytics](https://www.yieldigo.com/promotion-analytics/) | Describes scenario simulation, optimization targets, sales uplift, elasticity, cannibalization, pull-forward and performance review. Planning and reviewing underperformance are part of one process. | Three explicitly user-entered sales cases and a review loop. The single-product model cannot estimate basket effects, cannibalization or elasticity; these remain explicit limitations rather than fabricated forecasts. |
| [Omnia Retail SMB solution](https://www.omniaretail.com/solutions/smb) | Describes visual pricing rules, exception-led decisions and an explanation showing which rule applied, its trigger and result. | Goal-first workspace and a visible rule ledger with input values, required thresholds and pass/check states. Rules are deterministic and inspectable; no AI or automatic price publication is claimed. |
| [Sigma Promotion Pricing Management](https://www.sigmacomputing.com/resources/promotion-pricing-optimization) | The public application description combines scenario modeling, forecast lift and governed action on live warehouse data. Its broader platform presents a spreadsheet-style planning interaction. The public page does not disclose the underlying forecasting formulas. | Editable assumptions and side-by-side financial results connected to a review. PromoProof has no warehouse or forecast service; manually entered actual records are labeled separately from assumptions. |

## Product decisions

- Two objectives: protect contribution profit, or clear a chosen share of inventory within a loss limit. More revenue alone is not sufficient.
- Expected-case failure is a failed decision. Passing only expected sales produces a risk warning if another case fails. A distinct range and known stock are necessary for a fully checked decision.
- Inventory is a hard cap in planning, applied to both normal and promotional volume. Entered demand remains visible alongside modeled sales.
- The financially sustainable discount is calculated at expected feasible sales. It does not predict what volume a discount will cause.
- Actual totals start empty and are never copied from assumptions. The original plan is copied into the review; later edits do not rewrite it.
- Preserve v1's cents, price-rounding convention, negative-contribution branches, explicit save, backups, exports and browser-local processing.

These adaptations are our design choices, not claims that the reference tools implement the same equations or thresholds. Original v1 research remains in `RESEARCH.md`.
