const assert = require('node:assert/strict');
const fs = require('node:fs/promises');

const storageKey = 'cow.mdr.playbook.v1';
const unrelatedKey = 'cow.mdr.test.unrelated';
const focuses = ['foundations', 'research', 'protect', 'review'];
const fields = ['decision', 'evidence', 'risk', 'action', 'reviewDate', 'lesson'];
const reviewDate = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
const laterDate = new Date(Date.now() + 8 * 86400000).toISOString().slice(0, 10);
const example = {
  decision: 'Compare two options before committing any resources.',
  evidence: 'Read the original documentation and record unresolved questions.',
  risk: 'Access could fail; keep the commitment within the written limit.',
  action: 'Wait for the evidence review, then follow the approved scope.',
  reviewDate,
  lesson: 'Keep the original reasoning visible at the next review.'
};

module.exports = async function verifyMdrPlaybook(page, base, browser) {
  const form = page.locator('[data-decision-form]');
  const field = name => form.locator(`[name="${name}"]`);
  const approved = field('approved');
  const remember = field('remember');
  const status = page.locator('[data-decision-status]');
  const saved = () => page.evaluate(key => localStorage.getItem(key), storageKey);
  const fill = async (target, values = example) => {
    for (const [name, value] of Object.entries(values)) {
      await target.locator(`[name="${name}"]`).fill(value);
    }
  };
  const assertFocus = async (target, expected) => {
    await target.waitForFunction(value => {
      const selected = document.querySelector('[data-mdr-focus][aria-pressed="true"]');
      return selected && selected.dataset.mdrFocus === value;
    }, expected);
    assert.equal(await target.locator('[data-mdr-focus][aria-pressed="true"]').count(), 1,
      'Exactly one focus must be selected');
    assert.equal(await target.locator(`[data-mdr-focus="${expected}"]`).getAttribute('aria-controls'), 'focus-guide');
    assert((await target.locator('[data-focus-title]').innerText()).trim(), 'The selected focus needs a heading');
    assert(await target.locator('[data-focus-steps] li').count() >= 2, 'The selected focus needs useful steps');
  };
  const downloadText = async () => {
    const pending = page.waitForEvent('download');
    await page.locator('[data-download-decision]').click();
    const download = await pending;
    assert(/\.txt$/i.test(download.suggestedFilename()), 'Decision export must be a plain text file');
    const file = await download.path();
    assert(file, 'The export must produce an actual downloaded file');
    return fs.readFile(file, 'utf8');
  };
  const clearWithConfirmation = async accept => {
    const pending = page.waitForEvent('dialog');
    const click = page.locator('[data-clear-decision]').click();
    const dialog = await pending;
    assert.equal(dialog.type(), 'confirm', 'Clearing a decision requires confirmation');
    if (accept) await dialog.accept(); else await dialog.dismiss();
    await click;
  };

  await page.goto(`${base}/index.html`);
  const entry = page.getByRole('link', { name: 'Open the MDR Playbook', exact: true });
  assert.equal(await entry.count(), 1, 'Homepage must offer the MDR Playbook as its primary entry');
  assert.equal(await entry.getAttribute('href'), 'links.html');
  await entry.click();
  assert.match(await page.title(), /The MDR Playbook/);
  await form.waitFor({ state: 'visible' });
  assert.equal(await page.locator('[data-mdr-focus]').count(), focuses.length);

  const focusContents = new Set();
  for (const focus of focuses) {
    await page.goto(`${base}/links.html?focus=${focus}&category=Tools`);
    await assertFocus(page, focus);
    await page.locator('[data-links-grid] .card').first().waitFor();
    assert.equal(await page.getByRole('button', { name: 'Tools', exact: true }).getAttribute('aria-pressed'), 'true');
    focusContents.add(await page.locator('#focus-guide').innerText());
  }
  assert.equal(focusContents.size, focuses.length, 'Each focus must provide its own guidance');
  await page.goto(`${base}/links.html?focus=unknown&category=Tools`);
  await assertFocus(page, 'foundations');
  assert.equal(new URL(page.url()).searchParams.get('category'), 'Tools', 'Invalid focus must preserve the directory query');
  await page.goto(`${base}/links.html?focus=foundations&category=Tools`);
  await page.locator('[data-mdr-focus="research"]').click();
  await page.locator('[data-mdr-focus="protect"]').click();
  assert.equal(new URL(page.url()).searchParams.get('category'), 'Tools');
  await page.goBack();
  await assertFocus(page, 'research');
  await page.goBack();
  await assertFocus(page, 'foundations');
  await page.getByRole('button', { name: 'DEX', exact: true }).click();
  assert.equal(new URL(page.url()).searchParams.get('focus'), 'foundations', 'Directory filtering must preserve focus');

  await page.goto(`${base}/links.html?focus=foundations&category=Tools`);
  await page.locator('[data-mdr-focus="research"]').click();
  await page.getByRole('button', { name: 'CEX', exact: true }).click();
  await page.goBack();
  await assertFocus(page, 'foundations');
  assert.equal(await page.getByRole('button', { name: 'Tools', exact: true }).getAttribute('aria-pressed'), 'true', 'Back must restore the directory category as well as the focus');
  assert.match(await page.locator('[data-links-status]').innerText(), /in Tools/);
  await page.goForward();
  await assertFocus(page, 'research');
  assert.equal(await page.getByRole('button', { name: 'CEX', exact: true }).getAttribute('aria-pressed'), 'true', 'Forward must restore the directory category as well as the focus');

  await page.goto(`${base}/links.html`);
  await form.waitFor({ state: 'visible' });
  assert.equal(await remember.isChecked(), false, 'Remembering a draft must require opt-in');
  assert.equal(await approved.isChecked(), false);
  assert(await approved.isDisabled(), 'Incomplete research must not be approvable');
  assert.equal((await status.innerText()).trim(), 'Preparation in progress');

  const externalRequests = [];
  const trackRequest = request => {
    const url = new URL(request.url());
    if (/^https?:$/.test(url.protocol) && url.origin !== base) externalRequests.push(url.href);
  };
  page.on('request', trackRequest);
  try {
    await field('verdict').selectOption('proceed');
    await fill(form, { ...example, reviewDate: '' });
    assert(await approved.isDisabled(), 'A review date is required before approval');
    await field('reviewDate').fill(reviewDate);
    await field('risk').fill('   ');
    assert(await approved.isDisabled(), 'Whitespace is not a completed risk assessment');
    await field('risk').fill(example.risk);
    assert(await approved.isEnabled());
    assert.equal(await approved.isChecked(), false, 'Completing the sheet must never approve it automatically');
    assert.equal((await status.innerText()).trim(), 'Ready for your review');

    for (const name of fields) {
      await approved.check();
      assert.equal((await status.innerText()).trim(), 'Approved by you');
      await field(name).fill(name === 'reviewDate' ? laterDate : example[name] + ' Revised.');
      assert.equal(await approved.isChecked(), false, `Editing ${name} must invalidate earlier approval`);
    }
    const verdictStatuses = new Set();
    await approved.check();
    for (const verdict of ['wait', 'decline', 'research']) {
      await field('verdict').selectOption(verdict);
      assert.equal(await approved.isChecked(), false);
      assert(await approved.isDisabled(), `${verdict} is not an execution approval`);
      const text = (await status.innerText()).trim();
      assert(text && !['Approved by you', 'Ready for your review'].includes(text));
      verdictStatuses.add(text);
    }
    assert.equal(verdictStatuses.size, 3, 'Research, wait and decline need distinguishable statuses');
    assert.equal(await saved(), null, 'Editing without opt-in must not write the decision to localStorage');
    await page.reload();
    await form.waitFor({ state: 'visible' });
    for (const name of fields) assert.equal(await field(name).inputValue(), '', 'A non-remembered draft must not return after reload');

    const hostileNote = '<img data-mdr-injected src=x onerror="window.__mdrInjected=true"><script>window.__mdrInjected=true</script>';
    const draft = { ...example, lesson: hostileNote };
    await fill(form, draft);
    await field('verdict').selectOption('proceed');
    const exportedDraft = await downloadText();
    for (const value of Object.values(draft)) assert(exportedDraft.includes(value), 'The exported draft must contain the entered values');
    assert(exportedDraft.includes('Ready for your review'), 'An unapproved export must retain its draft status');
    await page.evaluate(key => localStorage.setItem(key, 'keep'), unrelatedKey);
    await remember.check();
    await page.waitForFunction(({ key, note }) => (localStorage.getItem(key) || '').includes(note), { key: storageKey, note: 'data-mdr-injected' });
    await approved.check();
    assert((await downloadText()).includes('Approved by you'), 'The export must describe the current human approval');
    await page.evaluate(key => {
      const value = JSON.parse(localStorage.getItem(key));
      value.approved = true;
      localStorage.setItem(key, JSON.stringify(value));
    }, storageKey);
    await page.reload();
    await form.waitFor({ state: 'visible' });
    for (const [name, value] of Object.entries(draft)) assert.equal(await field(name).inputValue(), value, `${name} must restore from an opted-in draft`);
    assert.equal(await field('verdict').inputValue(), 'proceed');
    assert.equal(await approved.isChecked(), false, 'Saved or browser-restored approval must never survive reload');
    assert.equal((await status.innerText()).trim(), 'Ready for your review');
    assert.equal(await page.locator('[data-mdr-injected]').count(), 0, 'Restored notes must remain text');
    assert.equal(await page.evaluate(() => Boolean(window.__mdrInjected)), false);
    assert(await remember.isChecked(), 'Restored drafts must visibly retain the remembering choice');
    await remember.uncheck();
    assert.equal(await saved(), null, 'Opting out must remove the saved draft');
    assert.equal(await field('lesson').inputValue(), hostileNote, 'Opting out must keep the current unsaved work');
    assert.equal(await page.evaluate(key => localStorage.getItem(key), unrelatedKey), 'keep', 'Opting out must not clear unrelated storage');
    await remember.check();
    await clearWithConfirmation(false);
    assert.equal(await field('decision').inputValue(), draft.decision, 'Cancelling clear must preserve the draft');
    assert(await saved(), 'Cancelling clear must preserve saved work');
    await clearWithConfirmation(true);
    for (const name of fields) assert.equal(await field(name).inputValue(), '', 'Confirmed clear must clear the decision fields');
    assert.equal(await approved.isChecked(), false);
    assert.equal(await saved(), null, 'Confirmed clear must remove the saved draft');
    assert.equal(await page.evaluate(key => localStorage.getItem(key), unrelatedKey), 'keep', 'Confirmed clear must not clear unrelated storage');
    assert.deepEqual(externalRequests, [], 'Editing, remembering, restoring and exporting must not send data off site');
  } finally {
    page.off('request', trackRequest);
  }

  const unavailable = await browser.newContext();
  try {
    await unavailable.addInitScript(key => {
      for (const method of ['getItem', 'setItem', 'removeItem']) {
        const original = Storage.prototype[method];
        Storage.prototype[method] = function (name, ...args) {
          if (name === key) throw new DOMException('Storage unavailable', 'SecurityError');
          return original.call(this, name, ...args);
        };
      }
    }, storageKey);
    const blocked = await unavailable.newPage();
    const errors = [];
    blocked.on('pageerror', error => errors.push(error.message));
    await blocked.goto(`${base}/links.html`);
    const blockedForm = blocked.locator('[data-decision-form]');
    await blockedForm.waitFor({ state: 'visible' });
    await fill(blockedForm);
    await blockedForm.locator('[name="verdict"]').selectOption('proceed');
    const blockedRemember = blockedForm.locator('[name="remember"]');
    if (await blockedRemember.isEnabled()) await blockedRemember.check();
    const storageStatus = blocked.locator('[data-storage-status]');
    assert(await storageStatus.isVisible());
    assert((await storageStatus.innerText()).trim(), 'Storage failure needs a visible explanation');
    await blockedForm.locator('[name="approved"]').check();
    assert.equal((await blocked.locator('[data-decision-status]').innerText()).trim(), 'Approved by you', 'Storage failure must leave the decision process functional');
    assert.deepEqual(errors, [], 'Unavailable storage must not cause an uncaught browser error');
  } finally {
    await unavailable.close();
  }

  const withoutScripts = await browser.newContext({ javaScriptEnabled: false });
  try {
    const plain = await withoutScripts.newPage();
    await plain.goto(`${base}/links.html`);
    const text = await plain.locator('main').innerText();
    for (const concept of ['scarcity', 'security', 'sovereignty', 'legacy', 'analysis', 'decision', 'approval', 'execution', 'review']) {
      assert(new RegExp(concept, 'i').test(text), `${concept} guidance must remain available without JavaScript`);
    }
    assert(await plain.locator('noscript a[href="data/links.json"]').isVisible(), 'The directory needs its no-JavaScript data fallback');
    assert.match(await plain.locator('noscript').allInnerTexts().then(values => values.join(' ')), /JavaScript/i);
    const plainForm = plain.locator('[data-decision-form]');
    if (await plainForm.isVisible()) {
      for (const control of await plainForm.locator('input, textarea, select, button').all()) {
        assert(await control.isDisabled(), 'Nonfunctional decision controls must be disabled without JavaScript');
      }
    }
  } finally {
    await withoutScripts.close();
  }

  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${base}/links.html`);
    for (const focus of focuses) {
      await page.locator(`[data-mdr-focus="${focus}"]`).click();
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Playbook ${focus} overflows at ${width}`);
    }
    if (width === 320 || width === 768) {
      await page.goto(`${base}/index.html`);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Homepage CTA overflows at ${width}`);
    }
  }
  await page.setViewportSize({ width: 1280, height: 900 });
  console.log('PASS: MDR focus routes/history, human approval, opt-in storage, real exports, storage failure, no-JS access, responsive layout');
};
