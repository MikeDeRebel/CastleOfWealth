# Castle Of Wealth

Castle Of Wealth is a static crypto hub built for GitHub Pages and Cloudflare DNS, targeting **www.derebel.be**.

## Stack

- Plain HTML
- Plain CSS
- Plain JavaScript
- No framework
- No build step

## Pages in this initial deliverable

- `index.html` — homepage with hero, quick access cards, featured platforms, start-here path, archive/social section.
- `links.html` — filterable links hub rendered dynamically from JSON data.

## Data source

- `data/links.json` is the source of truth for cards on `links.html`.
- `links.json` is mirrored for compatibility.

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

## Legal + risk disclosure

Every page footer includes:

> ⚠️ Virtual currencies, real risks. The only guarantee in crypto is risk.

`links.html` also includes a visible top warning:

> Some links may include referral codes. Crypto is high risk. Do your own research.
