module.exports = async function verifyMdrFalsifier(page, base, browser) {
  const assert = require('node:assert/strict');
  const fs = require('node:fs/promises');
  const {createHash} = require('node:crypto');
  const response=await page.goto(`${base}/links.html`);
  assert.equal(response.status(),200);
  const lab=page.locator('[data-mdr-falsifier]');
  assert(await lab.isHidden(),'Only the research route may show the falsifier');
  await page.locator('[data-mdr-focus="research"]').click();
  assert(await lab.isVisible(),'Research route must reveal the panel');
  assert.equal(await page.locator('[data-focus-link]').getAttribute('href'),'#mdr-falsifier');
  await page.locator('[data-mdr-focus="protect"]').click();
  assert(await lab.isHidden(),'Different route must hide the panel');
  await page.goBack();
  assert(await lab.isVisible(),'Browser Back must restore the research panel');
  const form=page.locator('[data-mdr-falsifier-form]');
  const control=name=>form.locator(`[name="${name}"]`);
  const exportButton=page.locator('[data-mdr-falsifier-export]');
  const status=page.locator('[data-mdr-falsifier-status]');
  assert(await exportButton.isDisabled(),'Never enable export with incomplete data');
  const asof=await page.evaluate(()=>{
    const d=new Date(Date.now()-172800000),p=n=>String(n).padStart(2,'0');
    return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
  });
  const future=await page.evaluate(()=>{
    const d=new Date(Date.now()+172800000),p=n=>String(n).padStart(2,'0');
    return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
  });
  const values={
    market:'BTC · weekly/4H → 15m/5m',
    asof,
    thesis:'Weekly resistance and lower 4H highs support a testable supply thesis.',
    trigger:'15m break of structure followed by 5m MSS.',
    opposite:'4H close above the weekly range high falsifies the proposed short.',
    source:'https://example.org/research/archived-chart',
    test:'Use unseen samples and scrambled labels; reject if advantage disappears after costs.'
  };
  for(const [name,value] of Object.entries(values)) await control(name).fill(value);
  for(const name of ['walkforward','randomize','friction']) await control(name).check();
  assert(await exportButton.isEnabled(),'Completed form enables a candidate-only export');
  assert.match(await status.innerText(),/CANDIDATE.*READY/);
  await control('asof').fill(future);
  assert(await exportButton.isDisabled(),'No future observations');
  await control('asof').fill(asof);
  await control('source').fill('javascript:alert(1)');
  assert(await exportButton.isDisabled(),'Unsafe source links fail closed');
  await control('source').fill('https://user:secret@evil.example/data');
  assert(await exportButton.isDisabled(),'Reject credential-bearing evidence sources');
  await control('source').fill(values.source);
  await control('opposite').fill(values.thesis);
  assert(await exportButton.isDisabled(),'A thesis cannot falsify itself');
  await control('opposite').fill(values.opposite);
  await control('test').fill('  ');
  assert(await exportButton.isDisabled(),'Whitespace is not a negative control');
  await control('test').fill(values.test);
  await control('randomize').uncheck();
  assert(await exportButton.isDisabled(),'Planning controls are required');
  await control('randomize').check();
  assert(await exportButton.isEnabled());
  const downloadPromise=page.waitForEvent('download');
  await exportButton.click();
  const download=await downloadPromise;
  assert.match(download.suggestedFilename(),/^mdr-research-candidate-\d{4}-\d\d-\d\d\.txt$/);
  const exportText=await fs.readFile(await download.path(),'utf8');
  const marker='CHECKSUM (SHA-256 of all preceding UTF-8 bytes): ';
  assert.equal(exportText.split(marker).length,2);
  const [body,digest]=exportText.split(marker);
  assert.equal(createHash('sha256').update(body,'utf8').digest('hex'),digest.trim(),'SHA-256 must match exact exported text');
  for (const value of Object.values(values)) assert(body.includes(value),'Preserve entered evidence');
  assert(body.includes('CANDIDATE (NOT VALIDATED)'));
  assert(body.includes('PLANNED CONTROLS — NOT RESULTS'));
  assert.match(await status.innerText(),/SNAPSHOT EXPORTED/);
  await control('thesis').fill('Changed since export');
  assert.doesNotMatch(await status.innerText(),/SNAPSHOT EXPORTED/,'Changes invalidate the current snapshot label');
  const dialogPromise=page.waitForEvent('dialog');
  const clearClick=page.locator('[data-mdr-falsifier-clear]').click();
  const dialog=await dialogPromise;
  await dialog.dismiss();await clearClick;
  assert.notEqual(await control('market').inputValue(),'');
  const again=page.waitForEvent('dialog');
  const clearAgain=page.locator('[data-mdr-falsifier-clear]').click();
  (await again).accept();await clearAgain;
  assert.equal(await control('market').inputValue(),'');
  assert(await exportButton.isDisabled());
  await page.reload();
  assert.equal(await control('market').inputValue(),'','No persistence on reload');
  await page.goto(`${base}/links.html?focus=research#mdr-falsifier`);
  assert(await lab.isVisible(),'Deep link must show the panel');
  const originalSize=page.viewportSize();
  for(const width of [320,360,390,600,768,960,1280]){
    await page.setViewportSize({width,height:900});
    await page.goto(`${base}/links.html?focus=research`);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`S03 horizontal overflow at ${width}px`);
  }
  if(originalSize)await page.setViewportSize(originalSize);
  const noScript=await browser.newContext({javaScriptEnabled:false});
  try{
    const p=await noScript.newPage();
    await p.goto(`${base}/links.html?focus=research`);
    assert(await p.locator('[data-mdr-falsifier]').isHidden(),'Do not expose inert controls without JS');
    assert(await p.locator('noscript').first().isVisible(),'The existing fallback must remain');
  }finally{await noScript.close();}
  console.log('PASS: MDR S03 evidence, falsification, SHA-256 export, fail-closed, privacy and responsive');
};
