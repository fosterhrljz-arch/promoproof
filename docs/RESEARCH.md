# Product research and implementation choices

Reviewed November 16, 2026 (America/Denver). Public pages and documentation only; no merchant accounts were accessed.

| Reference | Observed functionality and pattern | PromoProof decision |
| --- | --- | --- |
| [Shopify Profit Margin Calculator](https://www.shopify.com/tools/profit-margin-calculator) | Cost and markup inputs, a markup slider, shipping and customer acquisition costs, reset, advanced inputs, explanations distinguishing markup and margin. | Plain field names, a discount slider paired with a precise input, and accessible explanations. Use contribution profit rather than implying net business profit. |
| [Sellermetry Discount Profit Calculator](https://sellermetry.com/shopify-discount-profit-calculator) | Regular price, COGS, fulfillment and payment fees, discount and normal monthly volume; before/after profit and margin; required volume to replace normal profit. Explicitly distinguishes the mathematical target from predicted demand. | Show both unit economics and whole-period profit, with a prominent sales target. Add fixed campaign expenses and explicit zero/negative-margin handling. Keep the expected-sales forecast separate from required volume. |
| [Lightspeed Sales by Discount Report](https://shopkeep-support.lightspeedhq.com/hc/en-us/articles/47480025217947-Sales-by-Discount-Report) | Discount reporting over a selected date range, bar charts and tabular details, sorting, column/discount filters, export and print views. These analyze recorded sales. | Pair an informative chart with a financial breakdown table and scenario comparison. Provide CSV and print exports. Keep v1 focused on prospective single-product planning. |

The differentiator is a decision workspace combining one shared baseline, multiple alternative offers, campaign expenses, mathematical edge-case explanations, and private local persistence. V1 deliberately excludes POS connections, team accounts, inventory synchronization, marketplace-specific fee schedules, and demand prediction.
