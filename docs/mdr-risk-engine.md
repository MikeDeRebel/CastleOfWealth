# MDR S02 — Risk Engine

## Scope
One independent browser-only position-risk calculator inside the existing MDR Playbook, between the human decision card and the unchanged resource shelf. It is a research/planning aid—not a trade recommendation, portfolio reader, execution system, liquidation estimator or assurance that a stop will fill.

## Inputs
- Long/short, currency (USD/USDT/EUR), account equity (same currency), risk budget percentage.
- Entry and stop quote prices; stop must be lower than entry for a long and higher for a short.
- Explicit entry-fee %, exit-fee % and adverse-slippage buffer %. **Blank is not zero.**
- Maximum position notional as a multiple of equity. Default **1×** (no modeled leverage); higher values are an intentional change, never a margin or liquidation check.

## Conservative fixed-R formula
1. `1R = equity × (risk % / 100)`, rounded **down** to 12 decimal places.
2. `loss per unit = |entry − stop| + entry × entry-fee% + stop × adverse-slippage% + (stop + adverse-slippage amount) × exit-fee%`, rounding each fee/buffer component **up** to 12 decimal places. The exit fee is charged on a conservatively higher stop-plus-slippage price, including the fee-on-slippage cross-term.
3. `units by 1R = floor(1R / loss per unit, 8 decimal places)`.
4. `units by notional cap = floor(equity × max-notional multiple / entry, 8 decimal places)`.
5. The **minimum** of those quantities is reported only after separate modeled-loss and notional-budget assertions pass.

Money and percentage inputs use decimal-string parsing with native `BigInt` fixed-point arithmetic (12 decimal input places; eight decimal quantity ticks). There is no floating-point dependency in the risk/exposure safety assertions. Quantities greater than 100 million units are outside the model's display scope and fail closed.

## Guardrails
- Missing, negative, out-of-range, invalid-side or unrepresentable input → **STAND DOWN**, all previous numeric output cleared.
- A valid output is marked **MODEL CALCULATED**, not APPROVED or READY TO TRADE.
- Positions with notional above equity show an explicit margin/liquidation warning; the calculator does **not** model margin maintenance, funding, borrow fees or order fill guarantees.
- No API calls, provider credentials, account access, persistence, analytics or orders. Reload resets the model.
- Risk disclosures and referral statements remain unchanged; the original MDR human-approval card is still linked.

## Verification
The component was exercised locally in headless Chromium with Python Playwright using an isolated HTML preview:
- Deterministic worked examples for long, short and notional-cap modes.
- Fees and adverse-slippage requirement, invalid stop direction, reset, changed inputs, zero values, numerical safety, no-JavaScript fallback and no external requests.
- Ten responsive widths from 320 through 1600 pixels.
- **250 randomized calculation scenarios** compared against a separate Python `decimal.Decimal` reference; no budget overrun.
- JS syntax check passed.

An integration test `tests/mdr-risk-engine.cjs` is wired into the existing `tests/website.cjs`. The full Node Playwright suite is not runnable in the current isolated runtime because its Node Playwright module is unavailable; do not mark full integration PASS until it runs in the intended environment.

## Acceptance / release
Keep S02 in a separate PR, with `main` untouched until user PASS. Confirm the final desktop/mobile layout and the failure states before merging, then verify GitHub Pages publication. S01 was merged and its Pages deployment completed successfully before starting S02.
