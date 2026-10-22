const assert = require('node:assert/strict');

module.exports = async function verifyMdrEntryGate(page, base, browser) {
  await page.goto(`${base}/index.html`);
  const gate = page.locator('[data-mdr-entry-gate]');
  const checks = gate.locator('[data-mdr-gate-check]');
  const status = gate.locator('[data-mdr-gate-status]');
  const reset = gate.locator('[data-mdr-gate-reset]');
  const progress = gate.locator('[role="progressbar"]');
  assert.equal(await gate.count(), 1, 'The generic process section must have one MDR replacement');
  assert.equal(await page.locator('.path-section').count(), 0, 'Remove the previous three generic process cards');
  assert.equal(await checks.count(), 3);
  assert.equal(await status.innerText(), 'STAND DOWN / 0 OF 3 CHECKED');
  assert(await reset.isDisabled());
  assert.equal(await progress.getAttribute('aria-valuenow'), '0');
  assert.equal(await gate.locator('a[href="links.html#decision-card"]').count(), 1);
  for (const index of [1, 0, 2]) {
    await checks.nth(index).check();
    const complete = (await checks.evaluateAll(inputs => inputs.filter(input => input.checked).length));
    assert.equal(await progress.getAttribute('aria-valuenow'), String(complete));
    if (complete < 3) assert.match(await status.innerText(), /^STAND DOWN/);
  }
  assert.equal(await status.innerText(), 'CANDIDATE / HUMAN REVIEW REQUIRED');
  assert.match(await gate.innerText(), /no trade is authorised here/i);
  assert.equal(await progress.getAttribute('aria-valuenow'), '3');
  await checks.nth(1).uncheck();
  assert.equal(await status.innerText(), 'STAND DOWN / 2 OF 3 CHECKED', 'Any removed check must revoke candidate status');
  await reset.click();
  assert.equal(await status.innerText(), 'STAND DOWN / 0 OF 3 CHECKED');
  assert(await checks.first().isFocused(), 'Reset should return keyboard focus to the first check');
  await page.keyboard.press('Space');
  assert(await checks.first().isChecked(), 'The checkbox must be keyboard-operable');
  await page.reload();
  assert.equal(await status.innerText(), 'STAND DOWN / 0 OF 3 CHECKED', 'A reload must not reuse stale checks');
  for (const width of [320, 360, 390, 600, 768, 920, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.reload();
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      `Homepage with MDR gate must not overflow at ${width}px`);
  }
  const plainContext = await browser.newContext({ javaScriptEnabled: false });
  try {
    const plainPage = await plainContext.newPage();
    await plainPage.goto(`${base}/index.html`);
    assert(await plainPage.locator('#mdr-entry-gate noscript').isVisible(), 'No-JS fallback should remain readable');
    assert(await plainPage.locator('[data-mdr-gate-check]').first().isDisabled(), 'Never show functional controls without JavaScript');
  } finally {
    await plainContext.close();
  }
  await page.setViewportSize({ width: 1280, height: 900 });
  console.log('PASS: MDR Gate exact scope, STAND DOWN/candidate, reset, keyboard, stale state, no-JS, mobile widths');
};
