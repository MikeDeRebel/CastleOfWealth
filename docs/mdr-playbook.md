# MDR Playbook — 22 October 2026

## Purpose

The homepage's generic “Explore the library” entry becomes **“Open the MDR Playbook”**, still at `links.html`. The destination now expresses MikeDeRebel's public philosophy: preparation, capital protection, deliberate decisions and long-term independence. Castle Of Wealth remains the site brand; MikeDeRebel is the author.

The four foundations are scarcity, security, sovereignty and legacy. Four focus routes turn those principles into practical questions and a concrete next step: foundations, research, protection and review. The method is analysis → decision → human approval → execution → review. The website provides planning and recordkeeping; it never executes the user's plan.

## Implementation

- Plain HTML, scoped CSS and plain JavaScript; no framework, build step, account service or additional runtime dependency.
- Existing research artwork reused from the website. No new image download or external font request.
- Matching entry labels in the site's shared navigation. About-page positioning aligned with the existing homepage's wealth and independence message.
- Original directory, ten destinations, referral attribution and JSON data retained. Existing search, category query, empty-result and load/retry behavior remain available below the method and decision card.
- Category links within the site jump directly to the resource shelf. Browser Back/Forward restores both focus and category; navigation preserves loading/error states so the retry action stays usable.
- Historical pages and course content retained; historical figures remain snapshots.

## Decision card

One working card captures the decision, evidence and alternatives, risk and invalidation, next step, verdict, review date and optional review lesson. A **Proceed** verdict becomes available for personal approval only once the four preparation fields and a valid review date are filled. Whitespace does not count as preparation. Research, wait and decline are valid recorded decisions without execution approval.

Approval is an explicit user action. Every field or verdict edit clears it. Reloading or restoring the page also requires fresh approval. The record never claims that the website has assessed an investment, checked external evidence or authorised a transaction.

The user can download the current card as a UTF-8 text file, including its current approval status and export timestamp. This works for incomplete drafts as well as completed plans. Keep exported originals to compare with later reviews; the browser draft itself is editable, not an immutable journal.

## Storage and privacy

- Fields start unsaved. Checking **Remember this card on this device** opts into local storage for this browser origin under `cow.mdr.playbook.v1`.
- Only the known field names, verdict and format version are stored. Approval is never persisted or trusted from a restored payload.
- There is no account, cloud synchronisation, external analytics or API request containing the card. All authored content stays local unless the user downloads or otherwise shares it.
- Opting out removes only the Playbook's key and keeps the current unsaved fields. Clear asks for confirmation before removing the card and its saved copy.
- Browser storage can fail or be cleared. A visible message explains failures, while the editing and download flow remains usable. A downloaded copy is the portable record.
- Stored text is restored into form values and rendered with text nodes, never as HTML. Visitors are told to keep credentials and recovery phrases outside this page.

## Accessibility and compatibility

Semantic section headings, labelled controls, keyboard-operable focus buttons, visible focus styles and announced status changes support the interactive flow. The four foundations, initial focus guide and all five process steps are static HTML. Without JavaScript, the form is hidden and a printable decision-card prompt list appears; the original directory's JSON fallback remains available.

Use a static HTTP server for local review. `tests/website.cjs` runs the new behavioral contract in `tests/mdr-playbook.cjs` before the existing website regressions. Browser verification covers 320, 390, 768 and 1280 pixel viewports.

## Verification evidence

On 22 October 2026, the full browser suite passed in headless Chromium 151 with Playwright. It covers the new focus/card behavior and all existing website regressions. The suite includes mixed category/focus Back/Forward and preservation of the retry action after a failed directory request.

The original website suite passed before implementation. The new homepage CTA test failed before the product change. Two additional targeted regressions reproduced the category-history mismatch and the lost retry action, then passed after their fixes.

Independent read-only review found the category-history issue; it was corrected. Visual QA found and corrected a 320px cover/heading sizing issue. Fresh screenshots and viewport measurements confirmed no overflow at 320, 390 and 1280 pixels, readable hero text and decision-card anchors below the sticky header. The automated suite also covers 768 pixels. Screenshots are verification artifacts outside the product tree.

No external provider account access, balances, referral validity or financial performance were tested or claimed.

## Release

Review the exact changes in a GitHub pull request, merge the checked revision and verify the GitHub Pages deployment and live page. No DNS, private accounts, trading automation or provider-data changes are part of this update. The prior version remains recoverable through Git history.
