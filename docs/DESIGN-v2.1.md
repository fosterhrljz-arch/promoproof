# PromoProof 2.1 interface specification

This release changes the interface, not the v2 financial engine or saved-data schema. The user selected the public Shopify Analytics, Square Analytics and Lightspeed Analytics navigation pages as the design references. The written brief, primary-source research and three locally retained generated concepts guide the independently designed interface.

## Design system

- Canvas #f5f6f8, white surfaces, text #1d2735, secondary #697386, borders #e1e5eb, blue #365de3. Semantic green, amber and red only for decisions.
- Bundled Inter; body 14px/1.5, labels 12–13px, section headings 16–20px, page title 28px, home headline 42px. Controls use explicit typography.
- 208px white navigation rail, content padding 32px, maximum content width 1440px. Mobile collapses the rail into a top navigation bar. Panels use 10px radii, fine borders and minimal shadows.
- Shared controls: 38px minimum buttons, 40px inputs, 44px mobile touch targets, visible keyboard focus; Lucide outline icons.
- Primary screens: Home; Analysis with Decision / Compare scenarios / Review actuals; dedicated How It Works. Financial methodology stays accessible in a dialog.

## Content and layout inventory

Home: “Your promotion workspace”; headline “Know what your next promotion will earn.”; supporting product introduction; Create analysis / Explore example / See how it works; Canvas tote sample from the real engine; three-step workflow strip; Your analyses with Import backup / Back up library and real saved records or empty state.

Analysis: editable name, product/period/currency, save status, Export / Save analysis; three analysis views; scenario selector and New scenario / Duplicate; three progressive input disclosures (Product baseline, Business goal, Offer & sales). Decision banner and four financial indicators first, sensitivity chart, transparent rules, then detailed financial limits. Comparison preserves the same shared baseline and selected goal. Review preserves frozen plan snapshots and explicitly entered actual totals.

How It Works: introduction, four steps, worked tote example, definitions, saving/exporting/review instructions, explicit scope. In-page navigation becomes compact on narrow screens.

## Intentional adjustments to generated concepts

- Use the existing decision engine's exact titles and rules, rather than invented mockup wording or three simplified rules.
- Draw the exact linear contribution function, including negative profit at zero sales; the concept's bent line and positive starting profit are illustrative inaccuracies.
- Define campaign break-even (zero contribution profit) separately from sales needed to match normal profit; the generated guide conflated them.
- Display actual goal/capacity edge cases, long scenario names, unknown stock, and invalid-input guidance even when those states require more room.
- Highlight the active How It Works item correctly; the generated guide mistakenly highlights Home.
- Use compact, readable text sizes and generous spacing suitable for live controls rather than matching raster text imperfections. All UI remains code-native. No concept bitmap is shipped as functional UI.

## Preservation and QA

Before/after SHA-256 hashes verify that finance.mjs, decision.mjs, storage.mjs and exports.mjs are unchanged. The existing 42 financial, migration, review and export tests are retained. Browser QA covers new navigation and disclosures, both business goals, comparison case/metric controls, live exploration, save/reopen, JSON import/export, CSV exports, frozen reviews, validation, keyboard use and responsive layouts. Screenshots and the fidelity ledger accompany the local delivery. No hosting or upload is part of this release.
