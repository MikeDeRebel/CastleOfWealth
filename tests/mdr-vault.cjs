const assert = require('node:assert/strict');

module.exports = async function verifyMdrVault(page, base, browser) {
  await page.goto(`${base}/links.html`);
  const vault = page.locator('[data-mdr-vault]');
  const status = page.locator('[data-vault-status]');
  const form = page.locator('[data-vault-form]');
  const input = name => form.locator(`[name="${name}"]`);
  const cashLabel = page.locator('[data-vault-after]');
  const runway = page.locator('[data-vault-runway]');
  const fill = async values => {
    for (const [key, value] of Object.entries(values)) await input(key).fill(value);
  };
  assert(await vault.isHidden(), 'Vault must be hidden outside the protection focus');
  await page.locator('[data-mdr-focus="protect"]').click();
  assert(await vault.isVisible(), 'Vault must open on the protection focus');
  assert.equal(await status.innerText(), 'NOT ASSESSED');
  const values = { cash:'20000,00', essentials:'2500,00', bills:'1000,00', proposal:'3000,00', months:'6' };
  await fill(values);
  assert.equal(await status.innerText(), 'FLOOR MET · REVIEW ONLY');
  assert.equal(await runway.innerText(), '6.4');
  assert.match(await cashLabel.innerText(), /16,000\.00/);
  assert.equal(await page.locator('[data-vault-target]').innerText(), '€15,000.00');
  assert.equal(await page.locator('[data-vault-delta]').innerText(), '€1,000.00');
  assert.equal(await page.locator('[data-vault-results]').isVisible(), true);
  assert.equal(await page.locator('.mdr-vault-meter').getAttribute('aria-valuenow'), '100');
  await input('proposal').fill('4000,00');
  assert.equal(await runway.innerText(), '6.0');
  assert.equal(await status.innerText(), 'FLOOR MET · REVIEW ONLY', 'Exactly matching floor is valid arithmetic, not approval');
  await input('proposal').fill('4000,01');
  assert.equal(await status.innerText(), 'HOLD · BELOW YOUR FLOOR');
  assert.equal(await page.locator('[data-vault-delta]').innerText(), '−€0.01');
  await input('proposal').fill('30000');
  assert.equal(await status.innerText(), 'HOLD · CASH SHORTFALL');
  assert.equal(await runway.innerText(), '0.0');
  await input('proposal').fill('');
  assert.equal(await status.innerText(), 'NOT ASSESSED');
  assert(await page.locator('[data-vault-results]').isHidden(), 'Stale calculation must disappear for blank input');
  await input('proposal').fill('1.000,00');
  assert.equal(await status.innerText(), 'INVALID INPUT', 'Ambiguous thousands separators must be rejected');
  await input('proposal').fill('-1');
  assert.equal(await status.innerText(), 'INVALID INPUT');
  await input('proposal').fill('1000');
  await input('essentials').fill('0');
  assert.equal(await status.innerText(), 'INVALID INPUT');
  await input('essentials').fill('2500');
  await input('months').fill('37');
  assert.equal(await status.innerText(), 'INVALID INPUT');
  await input('months').fill('6');
  assert.equal(await status.innerText(), 'FLOOR MET · REVIEW ONLY');
  await input('currency').selectOption('USD');
  assert.match(await cashLabel.innerText(), /US\$/);
  await page.locator('[data-vault-reset]').click();
  assert.equal(await input('cash').inputValue(), '');
  assert.equal(await status.innerText(), 'NOT ASSESSED');
  await fill(values);
  await page.locator('[data-mdr-focus="research"]').click();
  assert(await vault.isHidden());
  await page.locator('[data-mdr-focus="protect"]').click();
  assert(await vault.isVisible());
  assert.equal(await input('cash').inputValue(), '', 'Switching away must erase financial inputs');
  await fill(values);
  await page.reload();
  await vault.waitFor({state:'visible'});
  assert.equal(await input('cash').inputValue(), '', 'Reload must not persist financial inputs');
  for (const width of [320,360,390,600,768,920,1280]) {
    await page.setViewportSize({width,height:900});
    await page.goto(`${base}/links.html?focus=protect#mdr-vault`);
    assert(await vault.isVisible());
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Vault overflow at ${width}px`);
  }
  const nojs = await browser.newContext({javaScriptEnabled:false});
  try {
    const plain = await nojs.newPage();
    await plain.goto(`${base}/links.html`);
    assert.match(await plain.locator('main').innerText(), /available cash.*committed bills.*proposed outflow/i);
  } finally { await nojs.close(); }
  console.log('PASS: MDR Vault protection focus, BigInt runway math, floor gating, invalid/stale input, privacy, mobile and no-JS');
};
