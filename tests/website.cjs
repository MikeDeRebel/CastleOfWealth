const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const root = path.resolve(__dirname, '..');
const server = http.createServer((req,res) => {
  const file = path.join(root, decodeURIComponent(req.url.split('?')[0] === '/' ? '/index.html' : req.url.split('?')[0]));
  if (!file.startsWith(root + path.sep)) {res.writeHead(403).end(); return;}
  fs.readFile(file, (err,data) => { if(err) {res.writeHead(404).end();return;}
    res.setHeader('Content-Type', ({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp'})[path.extname(file)] || 'application/octet-stream');res.end(data);
  });
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base = `http://127.0.0.1:${server.address().port}`;
 let browser;
 try {
  browser = await chromium.launch({channel:'msedge',headless:true}); const page = await browser.newPage();
  for(const name of ['index','links','trade','invest','guides','archive','about','disclaimer','bitcoin-technical-analysis-course','galactic_syndicate','galactic-syndicate']) {
   const response = await page.goto(`${base}/${name}.html`); assert.equal(response.status(),200,`${name} must be reachable`);
   assert(await page.locator('footer').innerText().then(t=>t.includes('Virtual currencies, real risks.')),`${name} needs visible risk disclosure`);
   assert((await page.locator('meta[name="viewport"]').getAttribute('content')).includes('width=device-width'),`${name} must use device width`);
   for(const resource of await page.locator('a[href], img[src],script[src],link[rel="stylesheet"]').evaluateAll(es=>es.map(e=>e.getAttribute('href')||e.getAttribute('src')))) {
    const url=new URL(resource, page.url()); if(url.origin!==base)continue;
    const response=await page.request.get(url.href); assert.equal(response.status(),200,`Broken local resource ${url}`);
   }
  }
  await page.goto(`${base}/links.html`); await page.locator('[data-links-grid] .card').first().waitFor();
  await page.getByRole('button',{name:'DEX',exact:true}).click(); assert.equal(await page.locator('[data-links-grid] .card').count(),3);
  await page.getByLabel('Search platforms').fill('Drift'); assert.equal(await page.locator('[data-links-grid] .card').count(),1);
  await page.getByLabel('Search platforms').fill('no-such-platform'); assert.equal(await page.locator('[data-links-grid] .card').count(),0);
  await page.route('**/data/links.json',r=>r.fulfill({contentType:'application/json',body:JSON.stringify([{name:'<img src=x onerror=alert(1)>',url:'javascript:alert(1)',category:'Tools'}])}));
  await page.goto(`${base}/links.html`); await page.locator('[data-links-status]').filter({hasText:'0'}).waitFor(); assert.equal(await page.locator('[data-links-grid] a').count(),0,'Unsafe URLs must not become links');
  await page.unroute('**/data/links.json');
  await page.route('**/data/links.json',r=>r.fulfill({status:503,body:'unavailable'})); await page.reload(); await page.getByRole('button',{name:'Try again'}).waitFor();
  await page.unroute('**/data/links.json'); await page.getByRole('button',{name:'Try again'}).click(); await page.locator('[data-links-grid] .card').first().waitFor();
  await page.goto(`${base}/guides.html#discipline`);await page.emulateMedia({reducedMotion:'reduce'});await page.reload();
  assert(await page.locator('#discipline h2').evaluate(e=>e.getBoundingClientRect().top>=document.querySelector('header').getBoundingClientRect().bottom),'Sticky header must not hide anchor heading');
  await page.goto(`${base}/index.html`);await page.keyboard.press('Tab');
  assert(await page.locator('.skip').evaluate(e=>{const r=e.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)===e;}),'Focused skip link must be visible above header');
  assert(await page.locator('.card-art').first().evaluate(e=>{const r=e.getBoundingClientRect();return r.width>r.height;}),'Landscape card images must not be stretched into portrait boxes');
  await page.goto(`${base}/bitcoin-technical-analysis-course.html`); assert(await page.locator('[data-course-prev]').isDisabled());
  for(let i=0;i<7;i++) await page.locator('[data-course-next]').click(); assert(await page.locator('[data-course-next]').isDisabled());
  for(const [i,v] of ['A','B','A','B','B'].entries()) await page.locator(`input[name="question-${i}"]`).nth(v==='A'?0:1).check();
  await page.getByRole('button',{name:'Submit Quiz',exact:true}).click(); assert((await page.locator('[data-quiz-result]').innerText()).includes('5 / 5'));
  for(const width of [390,1280]) {await page.setViewportSize({width,height:900}); for(const name of ['index','links','trade','invest','guides','archive','about','bitcoin-technical-analysis-course','galactic_syndicate']) {
   await page.goto(`${base}/${name}.html`); assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${name} overflows at ${width}`);
  }}
  await page.setViewportSize({width:390,height:844});await page.goto(`${base}/index.html`);
  await page.getByLabel('Open navigation',{exact:true}).press('Enter');await page.getByRole('navigation',{name:'Mobile navigation',exact:true}).getByRole('link',{name:'History',exact:true}).click();assert(page.url().endsWith('/archive.html'));
  await page.goto(`${base}/galactic_syndicate.html`);
  assert(await page.locator('.history-header').evaluate(e=>e.getBoundingClientRect().width===document.querySelector('.history-row').getBoundingClientRect().width),'History table headers and cells must stay aligned');
  if(process.env.QA_DIR){fs.mkdirSync(process.env.QA_DIR,{recursive:true});for(const width of [390,1280]){await page.setViewportSize({width,height:900});await page.goto(`${base}/index.html`);for(const img of await page.locator('.card-art').all()){await img.scrollIntoViewIfNeeded();await img.evaluate(e=>e.decode());}await page.getByRole('heading',{level:1}).scrollIntoViewIfNeeded();await page.screenshot({path:path.join(process.env.QA_DIR,`homepage-${width}.jpg`),fullPage:true});await page.screenshot({path:path.join(process.env.QA_DIR,`homepage-viewport-${width}.jpg`)});} await page.goto(`${base}/bitcoin-technical-analysis-course.html`);await page.screenshot({path:path.join(process.env.QA_DIR,'course-desktop.jpg'),fullPage:true});await page.goto(`${base}/galactic_syndicate.html`);await page.screenshot({path:path.join(process.env.QA_DIR,'archive-desktop.jpg'),fullPage:true});}
  console.log('PASS: routes, disclosures, filters, search, unsafe URL rejection, retry, course, responsive overflow');
 }finally{await browser?.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
