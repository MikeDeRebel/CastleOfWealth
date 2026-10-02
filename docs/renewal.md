# Website renewal — 2 October 2026

## Scope

Preserve Castle Of Wealth as an English crypto knowledge, platform, course and historical archive website. Keep the dark green/black/gold identity and CSS fortress. Complete the required static pages without a framework, build service or private financial-data import. Related existing GitHub issue: #13 (ten cinematic card assets); this renewal also includes the separately approved page/navigation work.

## Changes

- Shared readable responsive styles, five navigation destinations, keyboard-accessible mobile menu, visible skip link and sticky-header-aware anchor offsets.
- Ten distinct optimized WebP homepage images; meaningful destinations for each card.
- Trade, invest, guides, archive, about and disclaimer pages, plus a hyphenated archive compatibility entry. Original underscore dashboard URL retained.
- Library category query URLs, text search, result announcements, empty/error/retry states. Data is rendered with DOM/textContent and only HTTP(S) URLs become links. Both JSON files are synchronized.
- Original eight course slides and quiz logic preserved. The previous dead next-lesson link now leads to the decision checklist.
- Historical dashboard retains its original figures and imagery. Added archive context, replaced misleading live/upcoming labels, isolated legacy layout selectors, and kept mobile history columns aligned inside a scrollable container.
- Risk and referral disclosures in every footer; risk context near the top of relevant pages.

## Asset provenance

Generated with the built-in image generation tool as ten separate images, then encoded as 768 × 512 WebP at quality 82. The ten final files together occupy 747,708 bytes. No montage-derived replacement assets.

Shared prompt: cinematic premium Castle Of Wealth educational card, landscape 3:2, near-black forest green, restrained warm gold light, weathered stone, photorealistic still life or landscape, quiet mood, central focal point; no people, logos, readable text, watermarks, UI or montage.

| Asset | Distinct scene |
|---|---|
| renewal-trade.webp | Fortress trading desk, brass instruments and abstract chart |
| renewal-invest.webp | Treasury, gold coins and living olive tree |
| renewal-research.webp | Observatory library, telescope and notebooks |
| renewal-archive.webp | Archive shelves and leather journal |
| renewal-course.webp | Bitcoin learning desk and illustrated book |
| renewal-mindset.webp | Stone path to a mountain fortress at dawn |
| renewal-tools.webp | Brass compass, ruler and field notebook |
| renewal-syndicate.webp | Cosmic fortress beneath a green spiral galaxy |
| renewal-legacy.webp | Ancient oak beside a castle courtyard |
| renewal-freedom.webp | Open castle gate overlooking a misty landscape |

## Verification

`tests/website.cjs` passed on installed Edge with bundled Playwright. Checks include required pages and their local resources, filters/search/empty state, malicious URL rejection, failure/retry, eight-slide boundaries, a correctly answered five-question quiz, keyboard mobile navigation, skip visibility, anchor headings, device viewport metadata, table header/row alignment and no document overflow at 390 and 1280 pixels. All ten homepage images decoded while scrolling during screenshot capture.

The pre-change required-route test failed on the absent Trade page. Separate source comparison confirmed all 151 numeric tokens in the original historical dashboard remain in order, and course JavaScript is unchanged. JSON mirrors match. An independent read-only review identified viewport, style-collision, live-label, table-alignment, skip and anchor-offset defects; these were corrected and covered by fresh browser checks.

## Limits and release

This is locally built and tested; the owner approved publication on 2 October 2026. Release proceeds through a GitHub pull request to main and GitHub Pages, followed by deployment and live-page verification. DNS changes, trading actions and private-history imports remain outside scope. External platform availability, regional access, referral terms and archived action endpoints have not been revalidated. Historical figures are snapshots, not live data. Existing private source folders remain intact.

Serve with a static HTTP server for review. Publish only after reviewing the exact changes through the repository's GitHub route. Recovery: retain the original main revision; a release can be reverted through Git history. Never overwrite private source data to roll back the public site.

## Golden castle hero follow-up

The owner approved replacing the geometric CSS fortress with the proposed detailed golden castle artwork. `assets/img/castle-hero-v2.webp` is a 1280 × 853 WebP, 284,494 bytes, derived from one built-in image generation result using the original `header.png` as a style reference. The complete image appears beside the title on desktop and below the copy on mobile. Explicit dimensions reserve layout space; eager/high-priority loading suits the above-the-fold hero.

Only the homepage scene markup and scoped `.castle-hero` styles changed; the ten library cards and historical/course data remain intact. The existing browser regression suite passed. Additional browser checks at 320, 390, 768 and 1280 pixels confirm decoding, preserved source aspect ratio, full-frame containment, intended placement and no document overflow. This follow-up is locally implemented and tested; it has not yet been released to Pages.
