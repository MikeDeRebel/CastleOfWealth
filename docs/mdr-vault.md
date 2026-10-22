# MDR S04 — Wealth Vault / Liquidity Gate

## Why this slice exists
Castle of Wealth is about freedom and capital preservation—not telling people to hunt trading signals. This small, independent **Protect**-focus worksheet asks a concrete question before any optional capital allocation: **how much immediately accessible cash remains after bills and a proposed outflow, expressed as months of necessary expenses?**

The worksheet separates (1) committed bills, (2) an owner-chosen reserve floor, and (3) a proposed outflow. The site never decides how big someone's reserve should be. Mainstream education sources distinguish accessible emergency cash from investments and stress that income variability, dependents and spending flexibility matter:
- https://www.consumerfinance.gov/an-essential-guide-to-building-an-emergency-fund/
- https://investor.vanguard.com/investor-resources-education/article/understanding-income-volatility-and-emergency-saving
- https://corporate.vanguard.com/content/corporatesite/us/en/corp/articles/beyond-emergency-funds-a-smarter-cash-strategy.html

## Data contract and math
Inputs: currency (EUR, USD, GBP; display unit only), immediately accessible cash, average **essential** monthly expenses, bills already committed but not included in that monthly amount, proposed outflow and personal floor in months (1–36). Money inputs accept decimal dot or comma with at most 2 decimals and no grouping separators. All amounts are nonnegative; essential expenses must exceed zero. Missing is not zero. Nothing is pre-filled except the display currency (EUR).

All monetary operations use **BigInt integer cents**. Amounts are capped at 9,999,999,999.99 in the selected currency. This is deliberately a simple same-currency model; there is no FX conversion.

```
remaining cash = accessible cash − already committed bills − proposed outflow
owner floor = essential monthly costs × owner-selected months
headroom versus owner floor = remaining cash − owner floor
runway months = floor(max(remaining cash, 0) × 10 / monthly essentials) / 10
floor meter = min(100%, floor(max(remaining cash, 0) × 100 / owner floor))
```

The months display intentionally rounds **down**, never up. Results are blanked on every input change before validation. `HOLD · CASH SHORTFALL` when remaining cash is negative; `HOLD · BELOW YOUR FLOOR` below the owner's floor; `FLOOR MET · REVIEW ONLY` at/above it. No output means that an investment is safe, approved or appropriate; no claims about future income, expenses, taxes, access or returns.

## Privacy and safety
- No new API, broker connection, account balance, credential, cookie, analytics, localStorage, or network call from the component.
- Amounts are reset on reload, back/forward restoration, when switching out of the Protect focus, and through the clear action.
- With JavaScript unavailable, a plain-language version of the formula is visible; the disabled interactive section does not masquerade as functional.
- External JS/CSS dependencies are not introduced; code is native plain HTML/CSS/JavaScript.
- The existing risk disclosure, links directory, S01/S02/S03 modules and legal/referral text remain unchanged.

## Test and release gate
- Local isolated Chromium browser checks cover complete/incomplete/invalid values; exact boundary at/under the floor; cash shortfall; reset, focus toggles, reload, no-JS, keyboard, privacy and responsive layout.
- The Node Playwright integration test is in `tests/mdr-vault.cjs`, wired into `tests/website.cjs`. Only call the full repo suite PASS if run successfully in an environment with Node Playwright.
- PR is reviewed and approved separately before merge; then verify Pages deployment before beginning S05.
