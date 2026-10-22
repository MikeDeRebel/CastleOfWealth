# MDR S03 — Falsification Record

## Intent and scope

This is ONE research-only panel inside the existing **A better decision** focus of Castle Of Wealth's MDR Playbook. Its purpose is to preserve a hypothesis **before hindsight** and make evidence against the hypothesis explicit. It does not add signals, change the risk engine, inspect personal portfolios or touch broker APIs.

The panel is visible only for the URL focus=research. Switching focus and browser Back/Forward preserve the correct visibility; the research guide links directly to this panel. It creates one **CANDIDATE** record, never VALIDATED, PAPER, PILOT or LIVE.

## Inputs / fail-closed rules

Seven required fields:
1. Market and timeframes — e.g., BTC weekly/4H into 15m/5m; not a live market feed.
2. Evidence as-of — explicitly user-entered **local** time that must not be in the future. The exported interpretation is also shown in UTC, but is **not attested**.
3. HTF thesis and observable levels.
4. LTF confirmation rule — market structure such as BOS/CHoCH/MSS is mentioned as an example only.
5. Disproof / alternate explanation that must be different from the thesis.
6. An HTTPS original-source link **without embedded credentials**. No source fetch, security review or fact verification occurs.
7. An independent test plan with a rejection criterion.

Three planning-only checks must be defined: independent unseen/walk-forward sample, scrambled-label/random baseline, and fees/slippage/stress treatment. Checking them means a test is **planned**, not that it ran or passed.

Any missing, empty, future, unsafe or contradictory input leaves the status CANDIDATE · INCOMPLETE, with the export button disabled. A complete card becomes CANDIDATE · READY TO SNAPSHOT, never trade approval.

## Local evidence snapshot

An explicit export produces a UTF-8 text file containing every entered field, the planned controls, and a device-clock export timestamp. A WebCrypto SHA-256 checksum is appended over the preceding exact UTF-8 bytes; it can detect changes if the original is preserved. It is **not** an authoritative timestamp, digital signature, notarization, immutable journal or proof that the evidence was correct. Changing any input cancels the current SNAPSHOT EXPORTED label.

This panel uses no localStorage, cookies, HTTP calls, analytics, live data or order execution. Export is local to the browser; reload clears the working copy. If WebCrypto cannot run, editing remains possible and a recoverable error appears instead of a false success message. Sensitive credentials and API secrets must never be entered.

## Research basis

- CFA Institute, [Backtesting & Simulation — 2026 curriculum](https://www.cfainstitute.org/insights/professional-learning/refresher-readings/2026/backtesting-and-simulation): look-ahead and survivorship bias, rolling and walk-forward analysis.
- QuantConnect, [Research Guide](https://www.quantconnect.com/docs/v2/writing-algorithms/key-concepts/research-guide): look-ahead bias, overfitting, out-of-sample checks and paper trading.
- QuantConnect, [Optimization Parameters](https://www.quantconnect.com/docs/v2/writing-algorithms/optimization/parameters): fitting noisy historical parameters can mislead future performance.

The references support the reasons for these checks, not the validity of any user-entered hypothesis.

## Validation and release

Local isolated Chromium browser exercises verified focus selection/back-forward, incomplete/complete gates, future time rejection, non-HTTPS/credentialed URLs, duplicated disproof, whitespace, planning checkboxes, no external requests, local download, SHA-256 digest over exact bytes, export state invalidation, reset confirmation, crypto failure recovery and reload privacy. Twelve screen widths from 320 through 1600 pixels were checked with no horizontal overflow. A JavaScript-disabled browser cannot display false interactive controls.

The test environment blocks loopback and external browser navigation. The isolated tests therefore used page.set_content and a test-only SHA-256 hook to verify output; the deployed HTTPS browser will provide WebCrypto natively. The added Node Playwright contract is integrated into tests/website.cjs; **the full repository suite has not been executed here and must not be reported as green**.

**Do not merge without an explicit owner PASS.** After PASS, merge this PR, verify GitHub Pages success and check the live Playbook before S04.
