# PromoProof 2.0 financial model

The starting specification is the v1 README, `src/finance.mjs`, and its financial regression tests. The v1 baseline and contribution definitions, half-up retail pricing, whole-unit thresholds, and special cases are retained. New cost fields default to zero; migrated stock is unknown. No separate externally supplied specification was present in the project.

## Inputs and units

All money is tax-exclusive and uses one selected two-decimal currency. Currency changes labels only. Money inputs have at most two decimals, discounts and fee rates at most two percentage-point decimals, and units are nonnegative integers. The same comparison period applies to normal and promotion sales. No annualization is performed.

- P: regular unit price, positive.
- C: existing variable cost per unit + additional fulfillment per unit + other additional per-unit cost. Do not double count any component. Fixed payment fees may be allocated per unit by the user; there is no per-order basket model.
- f: combined sales-based fee rate, 0–100%, applied to tax-exclusive selling price.
- Q0: entered normal volume; Qc, Qe, Qo: conservative, expected and optimistic total promotional demand, ordered Qc ≤ Qe ≤ Qo.
- I: available units for the comparison period, optional for profit protection and strictly positive for clearance.
- d: discount, 0–100%.
- E: additional fixed campaign expense, not a per-unit expense.

Base monetary components and E are limited to 1,000,000 each; units to 10,000,000. Actual ledger totals are limited to 10 trillion each. The resulting integer-cent totals stay within JavaScript's exact integer range. BigInt is used for the financial arithmetic before display conversion.

## Profit calculation

1. Promotional selling price S = round-half-up-to-cent(P × (1 − d)).
2. Normal unit selling fee F0 = round-half-up-to-cent(P × f).
3. Promotional unit selling fee F1 = round-half-up-to-cent(S × f).
4. Normal modeled units q0 = min(Q0, I), and each promotional case q = min(Q, I). If I is unknown, use the entered quantity and report unverified capacity.
5. Normal unit contribution m0 = P − C − F0.
6. Promotional unit contribution m = S − C − F1.
7. Normal contribution profit B = m0 × q0.
8. Promotional contribution profit A(q) = m × q − E.
9. Profit change Δ = A(q) − B. Percentage change is displayed only when B > 0.

Revenue is selling price × modeled volume. Variable costs and sales-based fees are reported separately. Displayed revenue less displayed variable costs, fees, and campaign expenses reconciles exactly to contribution profit. This is not net business profit.

The fee-rounding convention is explicit: per unit, before multiplication. Real processors may round by order or settlement. The actual review accepts ledger totals so it does not invent fee precision.

## Goal rules

### Protect profits

Profit target T = max(B, 0) + user-selected extra profit target. This intentionally prevents a smaller loss from being labeled protected profit. The original v1 match-baseline threshold remains visible separately, including for negative B.

### Clear inventory

Required units U = ceil(I × sell-through target / 100), using integer arithmetic. Target share is strictly above zero and at most 100%. Profit target T = − maximum allowed campaign contribution loss. Each case must satisfy both q ≥ U and A(q) ≥ T. The loss limit is a total contribution-profit floor, not a limit on profit sacrificed relative to normal. Results display the normal comparison separately.

A below-cost clearance can be feasible within an explicit loss limit. More units then increase the loss, so the optimistic sales case can be the financially worst case. All three cases are checked.

### Overall decision

- Fail: expected modeled sales or profit misses the selected goal.
- Pass: all three cases meet the goal, the entered range has distinct endpoints and is confirmed, inventory is known, and no normal or promotional volume is capped.
- Risk/check: expected meets the goal but another case fails, the range is not distinct/confirmed, stock is unknown, or entered demand exceeds stock.
- Incomplete: inputs or goal are invalid. Results are withheld.

These are deterministic checks, not a predictive rating, confidence interval, probability, or launch guarantee. Conservative/optimistic refer to sales volume, not necessarily profit.

## Volume thresholds

For any profit target T, solve m × q − E ≥ T over nonnegative whole units. Let R = T + E.

- m > 0: minimum q = max(0, ceil(R / m)).
- m = 0: every volume qualifies when R ≤ 0; otherwise unreachable.
- m < 0: if R ≤ 0, the qualifying interval is 0 ≤ q ≤ floor((−R)/(−m)); otherwise unreachable.

A minimum above inventory is explicitly marked beyond stock. Clearance must also meet U, so a maximum qualifying profit volume can conflict with the clearance target. The rule outcomes show both conditions.

Three targets are differentiated: cover promotion costs (T = 0), match normal profit (T = B), and selected-goal profit (T as above). No positive-infinity or misleading negative minimum is displayed.

## Maximum sustainable discount

At the scenario's expected, stock-capped volume, binary-search the 0.00–100.00% grid for the greatest discount meeting the selected goal. Every candidate runs the same rounded-price and rounded-fee calculation. Nondecreasing net proceeds as price rises (fee rate ≤ 100%) makes this search monotonic.

Return no attainable discount if even full price fails the profit target, or expected volume fails the clearance target. A non-null ceiling meets the goal, and the next supported 0.01-point discount fails unless already at 100%. Demand and costs are held fixed. The ceiling is not a demand optimum or recommendation.

## Actual performance

A review snapshots product, period, currency, baseline, goal, selected scenario and capture time. The snapshot is copied and serialized independently of the editable plan. No amount is automatically labeled as actual.

Actual contribution = actual revenue − actual total variable costs − actual selling fees − actual campaign expenses. Actual sales are recorded as entered, without a planning stock cap; excess against planned stock is flagged. Zero units with positive revenue is invalid.

Variance = actual contribution − frozen expected contribution. The exact reconciliation is revenue difference minus each cost difference. The review checks actual units and actual contribution against the frozen target, and keeps any original stock-limit exception visible. The difference from the hypothetical normal baseline is not evidence of causal incremental demand.

## Boundaries

One product; one currency; constant per-unit costs and fee rate within an analysis; every planned promotion unit receives the discount. No separate fixed overhead, tax, returns, cannibalization, pull-forward, price elasticity, basket economics, mixed-price units, replenishment schedule, salvage value or long-term value model. User-entered actual totals should follow the same accounting definitions.

## Migration and evidence

Version 1 imports preserve the original baseline and scenario amounts. New cost components are zero; inventory is unknown; conservative and optimistic are copied from the old expected volume with the range explicitly unconfirmed. The old browser key remains untouched. Version 2 JSON includes goals and frozen review plans. Corrupt storage is not silently overwritten.

`tests/finance.test.mjs` retains the original financial cases. `tests/decision.test.mjs` covers fees, stock caps, goal rules, negative-margin clearance, exact discount boundaries, immutable snapshots, actual reconciliation, migration and export round trips.
