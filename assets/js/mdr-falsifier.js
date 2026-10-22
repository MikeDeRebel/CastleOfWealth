(function mdrResearchFalsifier() {
  'use strict';
  const root = document.querySelector('[data-mdr-falsifier]');
  if (!root) return;
  const form = root.querySelector('[data-mdr-falsifier-form]');
  const status = root.querySelector('[data-mdr-falsifier-status]');
  const counter = root.querySelector('[data-mdr-falsifier-count]');
  const detail = root.querySelector('[data-mdr-falsifier-detail]');
  const exportButton = root.querySelector('[data-mdr-falsifier-export]');
  const resetButton = root.querySelector('[data-mdr-falsifier-clear]');
  const names = ['market', 'asof', 'thesis', 'trigger', 'opposite', 'source', 'test'];
  const checks = ['walkforward', 'randomize', 'friction'];
  const controls = Object.fromEntries([...names, ...checks].map(name => [name, form.elements.namedItem(name)]));
  let version = 0;
  let exportedVersion = -1;
  let isExporting = false;
  let exportError = '';

  const isResearch = () => new URLSearchParams(location.search).get('focus') === 'research';
  const showForFocus = () => { root.hidden = !isResearch(); };
  document.querySelectorAll('[data-mdr-focus]').forEach(button => button.addEventListener('click', showForFocus));
  window.addEventListener('popstate', showForFocus);
  window.addEventListener('pageshow', () => { exportedVersion = -1; isExporting = false; update(); showForFocus(); });
  showForFocus();
  // A deep link can target a panel hidden during initial HTML parsing.
  if (isResearch() && location.hash === '#mdr-falsifier') {
    requestAnimationFrame(() => root.scrollIntoView({block:'start'}));
  }

  const sourceIsSafe = value => {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && Boolean(url.hostname) && !url.username && !url.password;
    } catch { return false; }
  };
  const timeIsValid = value => {
    if (!value || !controls.asof.validity.valid) return false;
    const parsed = new Date(value);
    return Number.isFinite(parsed.getTime()) && parsed.getTime() <= Date.now();
  };
  const data = () => Object.fromEntries(names.map(name => [name, controls[name].value.trim()]));
  const assess = () => {
    const v = data();
    const present = names.filter(name => Boolean(v[name]));
    const checked = checks.filter(name => controls[name].checked);
    const timeOK = timeIsValid(v.asof);
    const sourceOK = sourceIsSafe(v.source);
    const distinct = v.thesis && v.opposite && v.thesis.toLowerCase() !== v.opposite.toLowerCase();
    return {
      values:v, fields:present.length, checks:checked.length,
      complete: present.length === names.length && checked.length === checks.length && timeOK && sourceOK && distinct,
      timeOK, sourceOK, distinct
    };
  };
  function update() {
    const result = assess();
    counter.textContent = `${result.fields} / 7 evidence fields · ${result.checks} / 3 checks planned`;
    exportButton.disabled = isExporting || !result.complete;
    if (exportedVersion === version && result.complete) {
      status.textContent = 'CANDIDATE · SNAPSHOT EXPORTED';
      detail.textContent = 'Keep the original file before evaluating the outcome. This is not strategy validation.';
    } else if (result.complete) {
      status.textContent = 'CANDIDATE · READY TO SNAPSHOT';
      detail.textContent = 'Complete research memo, not verified evidence. Review it independently before any next gate.';
    } else {
      status.textContent = 'CANDIDATE · INCOMPLETE';
      if (result.values.asof && !result.timeOK) detail.textContent = 'Use an actual past observation time (local to your device), never a future timestamp.';
      else if (result.values.source && !result.sourceOK) detail.textContent = 'Enter an HTTPS source without embedded credentials. The website does not fetch or verify it.';
      else if (result.values.thesis && result.values.opposite && !result.distinct) detail.textContent = 'The disproof must differ from the original thesis. Describe an opposing outcome.';
      else detail.textContent = 'Complete the evidence and planned checks. No market data is retrieved.';
    }
    if (exportError) detail.textContent = exportError;
  }
  form.addEventListener('submit', e => e.preventDefault());
  form.addEventListener('input', () => {version += 1; exportedVersion = -1; exportError = ''; update();});
  form.addEventListener('change', () => {version += 1; exportedVersion = -1; exportError = ''; update();});
  resetButton.addEventListener('click', () => {
    if (!window.confirm('Clear this unsaved research memo? Download the candidate snapshot first if you need it.')) return;
    form.reset();
    version += 1;
    exportedVersion = -1;
    exportError = '';
    update();
    controls.market.focus();
  });

  const plainText = (d, time) => [
    'MDR FIELD RECORD 003 — CASTLE OF WEALTH',
    'Research stage: CANDIDATE (NOT VALIDATED)',
    'Method: Preparation beats prediction.',
    `Export device timestamp UTC: ${time.toISOString()}`,
    `Evidence as-of (user-entered local time): ${d.asof}`,
    `Evidence as-of interpreted UTC: ${new Date(d.asof).toISOString()}`,
    '',
    'MARKET AND TIMEFRAMES', d.market, '',
    'HTF THESIS AND KEY LEVELS', d.thesis, '',
    'LTF CONFIRMATION RULE', d.trigger, '',
    'DISPROOF AND ALTERNATIVE SCENARIO', d.opposite, '',
    'ORIGINAL EVIDENCE SOURCE (NOT VERIFIED)', d.source, '',
    'INDEPENDENT TEST PLAN (NOT PERFORMED)', d.test, '',
    'PLANNED CONTROLS — NOT RESULTS',
    '[x] Untouched / walk-forward period declared',
    '[x] Scrambled-label or randomized negative control declared',
    '[x] Costs/slippage/stress assumptions declared',
    '',
    'LIFECYCLE: CANDIDATE → VALIDATED → PAPER → PILOT → LIVE → RETIRED',
    'No promotion, approval, broker connection or execution occurs here.',
    'No source or market observations were independently verified.',
    'The device clock and user-entered as-of time are not trusted timestamps.',
    'A SHA-256 checksum alone is not tamperproof, not notarization and not proof of authorship.',
    'https://derebel.be/links.html?focus=research#mdr-falsifier'
  ].join('\n') + '\n';

  exportButton.addEventListener('click', async () => {
    if (isExporting || root.hidden) return;
    const result = assess();
    if (!result.complete) { update(); return; }
    const atVersion = version;
    const atTime = new Date();
    const body = plainText(result.values, atTime);
    isExporting = true;
    exportButton.disabled = true;
    detail.textContent = 'Preparing your local research snapshot…';
    try {
      // The checksum is of the exact exported body before the fingerprint footer.
      const bytes = new TextEncoder().encode(body);
      const digest = await crypto.subtle.digest('SHA-256', bytes);
      if (version !== atVersion || root.hidden) { update(); return; }
      const hex = [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
      const documentText = body + `CHECKSUM (SHA-256 of all preceding UTF-8 bytes): ${hex}\n`;
      const blob = new Blob([documentText], {type:'text/plain;charset=utf-8'});
      const url = URL.createObjectURL(blob);
      try {
        const link = document.createElement('a');
        link.href = url;
        link.download = 'mdr-research-candidate-' + atTime.toISOString().slice(0, 10) + '.txt';
        link.hidden = true;
        document.body.append(link);
        link.click();
        link.remove();
        exportedVersion = atVersion;
      } finally { window.setTimeout(() => URL.revokeObjectURL(url), 1000); }
    } catch {
      exportError = 'Could not create the snapshot in this browser. Copy your notes elsewhere before closing this page.';
    } finally {
      isExporting = false;
      update();
    }
  });

  // No localStorage, cookies, telemetry or broker/API requests from this component.
  form.reset();
  update();
})();
