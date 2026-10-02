# Castle Of Wealth

Castle Of Wealth is a static crypto hub built for GitHub Pages and Cloudflare DNS, targeting **www.derebel.be**.

## Stack

- Plain HTML
- Plain CSS
- Plain JavaScript
- No framework
- No build step

## Pages

- `index.html` — homepage with hero, quick access cards, featured platforms, start-here path, archive/social section.
- `links.html` — filterable links hub rendered dynamically from JSON data.
- `trade.html` and `invest.html` — venue, custody and risk context, leading to the appropriate library categories.
- `guides.html` — course entry and practical decision/recordkeeping checklists.
- `bitcoin-technical-analysis-course.html` — preserved eight-slide introduction and five-question quiz.
- `archive.html` — historical archive entry.
- `galactic_syndicate.html` — original historical dashboard address, with preserved numeric records and explicit snapshot context.
- `galactic-syndicate.html` — compatibility entry linking to the original dashboard.
- `about.html` and `disclaimer.html` — purpose, author, referrals and risk disclosure.

All pages use `assets/css/style.css`. The original historical dashboard keeps its layout styles, with isolated legacy selectors to prevent shared CSS collisions.

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

There is no product build or runtime dependency. Development verification uses Node.js, Playwright and an installed Microsoft Edge browser:

```powershell
$env:PLAYWRIGHT_PATH = 'path/to/playwright'
node tests/website.cjs
```

The test starts and closes its own loopback server. It checks required routes, local links/assets, disclosures, category/search behavior, unsafe URL rejection, load/retry, course navigation/quiz, keyboard navigation, anchor visibility, historical table alignment and desktop/mobile overflow. Optional `QA_DIR` saves screenshots outside the product tree.

See [renewal notes](docs/renewal.md) for scope, asset provenance and limitations. Publishing to GitHub Pages is a separate release step.

## Legal + risk disclosure

Every page footer includes:

> ⚠️ Virtual currencies, real risks. The only guarantee in crypto is risk.

`links.html` also includes a visible top warning:

> Some links may include referral codes. Crypto is high risk. Do your own research.
