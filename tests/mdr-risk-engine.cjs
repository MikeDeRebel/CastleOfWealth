const assert = require('node:assert/strict');

const filled = {
  side: 'long', currency: 'USD', equity: '10000', riskPercent: '1',
  entry: '100', stop: '95', entryFee: '0.1', exitFee: '0.1',
  slippage: '0.2', maxExposure: '2'
};

module.exports = async function verifyMdrRiskEngine(page, base, browser) {
  const external = [];
  const track = request => {
    if (/^https?:/.test(request.url()) && new URL(request.url()).origin !== base) external.push(request.url());
  };
  page.on('request', track);
  try {
    const response = await page.goto(`${base}/links.html`);
    assert.equal(response.status(), 200);
    const form = page.locator('[data-mdr-risk-form]');
    await form.waitFor({ state: 'visible' });
    const control = name => form.locator(`[name="${name}"]`);
    const state = page.locator('[data-r-state]');
    const quantity = page.locator('[data-r-quantity]');
    const fill = async values => {
      for (const [name, value] of Object.entries(values)) {
        if (name === 'side' || name === 'currency') await control(name).selectOption(value);
        else await control(name).fill(value);
      }
    };
    assert.equal(await state.innerText(), 'STAND DOWN', 'Blank private model must fail closed');
    assert.equal(await quantity.innerText(), '—');
    assert.equal(await control('maxExposure').inputValue(), '1', 'Default notional cap must be 1×');
    assert.equal(await page.locator('a[href="#mdr-risk-engine"]').count(), 1, 'MDR Risk Engine must have one navigation anchor');

    const withoutExitFee = { ...filled };
    delete withoutExitFee.exitFee;
    await fill(withoutExitFee);
    assert.equal(await state.innerText(), 'STAND DOWN', 'Missing fees must not silently default to zero');
    await control('exitFee').fill(filled.exitFee);
    assert.equal(await state.innerText(), 'MODEL CALCULATED');
    assert.equal(await quantity.innerText(), '18.56944694');
    assert.equal(await page.locator('[data-r-budget]').innerText(), '100.00 USD');
    assert.equal(await page.locator('[data-r-notional]').innerText(), '1,856.94 USD');
    assert.equal(await page.locator('[data-r-exposure]').innerText(), '0.19×');
    const risk = Number((await page.locator('[data-r-loss]').innerText()).split(' ')[0].replaceAll(',', ''));
    assert(risk <= 100, 'Rounded quantity must not spend more than 1R');

    await control('stop').fill('105');
    assert.equal(await state.innerText(), 'STAND DOWN', 'Long stop above entry must block output');
    assert.equal(await quantity.innerText(), '—', 'Invalid input must erase stale model');
    await control('side').selectOption('short');
    assert.equal(await state.innerText(), 'MODEL CALCULATED');
    assert.equal(await quantity.innerText(), '18.46650453', 'Short formula and fees must work');

    await fill({side:'long',currency:'EUR',equity:'1000',riskPercent:'1',entry:'100',stop:'99.9',entryFee:'0',exitFee:'0',slippage:'0',maxExposure:'1'});
    assert.equal(await quantity.innerText(), '10.00000000', 'Conservative notional cap must bind');
    assert.equal(await page.locator('[data-r-loss]').innerText(), '1.00 EUR');
    assert.equal(await page.locator('[data-r-budget]').innerText(), '10.00 EUR');
    assert.equal(await page.locator('[data-r-usage]').innerText(), '10%');
    assert.match(await page.locator('[data-r-warning]').innerText(), /Notional cap applied/);
    await control('maxExposure').fill('2');
    assert.match(await page.locator('[data-r-warning]').innerText(), /Exposure exceeds equity/, 'Model must flag leverage-related omissions');
    await control('riskPercent').fill('100');
    assert.equal(await state.innerText(), 'STAND DOWN', 'Out-of-bound risk budget must fail closed');
    await control('riskPercent').fill('1');
    await control('slippage').fill('');
    assert.equal(await state.innerText(), 'STAND DOWN', 'Cleared required input must erase earlier result');

    await form.locator('button[type="reset"]').click();
    assert.equal(await state.innerText(), 'STAND DOWN');
    assert.equal(await control('equity').inputValue(), '');
    assert.equal(await control('maxExposure').inputValue(), '1');
    await fill(filled);
    for (const width of [320, 390, 768, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `S02 overflows at ${width}px`);
    }
    await page.reload();
    await form.waitFor({ state: 'visible' });
    assert.equal(await state.innerText(), 'STAND DOWN', 'Reload may not restore calculator state');
    assert.equal(await control('equity').inputValue(), '', 'No account-size persistence');
    assert.equal(await control('maxExposure').inputValue(), '1');
    assert.deepEqual(external, [], 'Calculator must not contact external hosts');
  } finally {
    page.off('request', track);
  }
  const noscript = await browser.newContext({ javaScriptEnabled: false });
  try {
    const plain = await noscript.newPage();
    await plain.goto(`${base}/links.html`);
    assert.equal(await plain.locator('[data-mdr-risk-form]').isVisible(), false, 'No inactive calculator inputs without JavaScript');
    assert.match((await plain.locator('#mdr-risk-engine noscript').innerText()), /stop distance/i, 'Fallback must include a manual formula');
  } finally { await noscript.close(); }
  console.log('PASS: MDR Risk Engine deterministic long/short math, fee/slippage guard, stop-side validity, cap, leverage warnings, reset, privacy, 320-1280px');
};
