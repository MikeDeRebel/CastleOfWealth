# Castle Of Wealth

Castle Of Wealth is a personal field guide to building and protecting lasting wealth and independence, by MikeDeRebel. The static website uses GitHub Pages and Cloudflare DNS at **derebel.be**.

## Stack

- Plain HTML
- Plain CSS
- Plain JavaScript
- No framework
- No build step

## Pages

- `index.html` — homepage with hero, quick access cards, featured platforms, start-here path, archive/social section.
- `links.html` — the MDR Playbook: four focus routes, the five-step decision method, an optional local decision card and the original filterable resource library.
- `trade.html` and `invest.html` — venue, custody and risk context, leading to the appropriate library categories.
- `guides.html` — course entry and practical decision/recordkeeping checklists.
- `bitcoin-technical-analysis-course.html` — preserved eight-slide introduction and five-question quiz.
- `archive.html` — historical archive entry.
- `galactic_syndicate.html` — original historical dashboard address, with preserved numeric records and explicit snapshot context.
- `galactic-syndicate.html` — compatibility entry linking to the original dashboard.
- `about.html` and `disclaimer.html` — purpose, author, referrals and risk disclosure.

All pages use `assets/css/style.css`. The original historical dashboard keeps its layout styles, with isolated legacy selectors to prevent shared CSS collisions.

The Playbook additionally uses `assets/css/playbook.css` and `assets/js/playbook.js`. Its principles and process remain readable without JavaScript. Focus links such as `links.html?focus=protect` are shareable; the existing `category` query parameters still filter the directory. See [MDR Playbook notes](docs/mdr-playbook.md) for the decision-card behavior and scope.

## Data source

- `data/links.json` is the source of truth for cards on `links.html`.
- `links.json` is mirrored for compatibility.
- The library supports category URLs such as `links.html?category=DEX`, text search, an empty result state and retry after loading failures. Only HTTP(S) URLs become links; data text is rendered as text rather than HTML.

Each object follows this shape:

```json
{
  "name": "Bybit",
  "url": "https://www.bybit.com/invite?ref=QEGWAQ",
  "category": "CEX",
  "subCategory": "Perps",
  "description": "Main leveraged trading exchange.",
  "referral": true,
  "highlight": true,
  "region": "Global",
  "risk": "High"
}
```

## Local run

Because links are fetched from JSON, use a local static server instead of opening `file://` directly.

```bash
python3 -m http.server 8080
```

Then open:

- `http://localhost:8080/index.html`
- `http://localhost:8080/links.html`

## Browser verification

There is no product build or runtime dependency. Development verification uses Node.js, Playwright and Chromium (or an installed Edge browser):

```powershell
$env:PLAYWRIGHT_PATH = 'path/to/playwright'
$env:PLAYWRIGHT_CHANNEL = 'msedge' # Optional; omit to use bundled Chromium.
node tests/website.cjs
```

For a separately installed Chromium, set `PLAYWRIGHT_EXECUTABLE_PATH` to its executable instead. The test starts and closes its own loopback server. It checks the MDR focus/history flow, explicit approval and invalidation, optional local persistence, real text downloads, unavailable storage and no-JavaScript guidance. It also checks the existing routes, local links/assets, disclosures, category/search behavior, unsafe URL rejection, load/retry, course navigation/quiz, keyboard navigation, anchor visibility, historical table alignment and responsive overflow. Optional `QA_DIR` saves screenshots outside the product tree.

See [renewal notes](docs/renewal.md) for scope, asset provenance and limitations. Publishing to GitHub Pages is a separate release step.

## Legal + risk disclosure

Every page footer includes:

> ⚠️ Virtual currencies, real risks. The only guarantee in crypto is risk.

`links.html` also includes the crypto risk warning at the top and referral disclosure alongside the directory. Existing directory risk labels are explicitly described as original labels, not independent assessments. Provider terms, regional availability and referral endpoints are not newly verified by the Playbook.
