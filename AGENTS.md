\# AGENTS.md



\## Project



Castle Of Wealth is a static crypto hub hosted on GitHub Pages.



The site brand is "Castle Of Wealth".

"MikeDeRebel" is the author/persona/nickname, not the site brand.



Primary domain target:

\- https://www.derebel.be



Hosting:

\- GitHub Pages

\- Cloudflare DNS



Stack:

\- Plain HTML

\- Plain CSS

\- Plain JavaScript

\- No framework

\- No build step unless explicitly requested



\## Site Goal



Create a clean degen-style crypto website with historical value.



The site should provide:

\- Overview of crypto links

\- Where to trade

\- Where to invest

\- How-to guides

\- Galactic Syndicate / Galactic Mining Club history

\- Archive/lore from MikeDeRebel posts and socials



\## Brand Direction



Style:

\- Clean but degen

\- Dark theme

\- Castle / galaxy / lab / treasury vibe

\- Mobile-first

\- Fast-loading

\- Simple navigation

\- Card-based layout



Tone:

\- Direct

\- Degen-native

\- Clear

\- No corporate fluff



\## Required Legal Warning



This warning must appear in the footer on every page:



⚠️ Virtual currencies, real risks. The only guarantee in crypto is risk.



For high-risk pages such as Trade, Invest, Guides, DEX, CEX, leverage, yield, or referrals, also include a visible risk warning near the top.



\## Referral Disclosure



Some links are referral links.



Use this disclosure where relevant:



Some links may include referral codes. Using them supports Castle Of Wealth.



Do not make guaranteed-profit claims.

Do not promise returns.

Do not hide risk warnings.



\## Pages



Required pages:

\- `index.html` — homepage

\- `links.html` — full links hub

\- `trade.html` — where to trade

\- `invest.html` — where to invest / earn

\- `guides.html` — how-to guides

\- `galactic-syndicate.html` — Galactic Syndicate / Galactic Mining Club

\- `archive.html` — historical posts, lore, old theses

\- `about.html` — about Castle Of Wealth and MikeDeRebel

\- `disclaimer.html` — legal/risk disclaimer



\## Data



Store platform links in:



`data/links.json`



Each link object should use this shape:



```json

{

&#x20; "name": "Bybit",

&#x20; "url": "https://www.bybit.com/invite?ref=QEGWAQ",

&#x20; "category": "CEX",

&#x20; "subCategory": "Perps",

&#x20; "description": "Main leveraged trading exchange",

&#x20; "referral": true,

&#x20; "highlight": true,

&#x20; "region": "Global",

&#x20; "risk": "High"

}

