(function initMdrVault() {
  'use strict';
  const root = document.querySelector('[data-mdr-vault]');
  if (!root) return;
  const form = root.querySelector('[data-vault-form]');
  const status = root.querySelector('[data-vault-status]');
  const detail = root.querySelector('[data-vault-detail]');
  const results = root.querySelector('[data-vault-results]');
  const runway = root.querySelector('[data-vault-runway]');
  const afterOutput = root.querySelector('[data-vault-after]');
  const targetOutput = root.querySelector('[data-vault-target]');
  const deltaOutput = root.querySelector('[data-vault-delta]');
  const conclusion = root.querySelector('[data-vault-conclusion]');
  const bar = root.querySelector('[data-vault-bar]');
  const meter = root.querySelector('[role="progressbar"]');
  const controls = Object.fromEntries(['currency','cash','essentials','bills','proposal','months'].map(name => [name, form.elements.namedItem(name)]));
  const amountNames = ['cash','essentials','bills','proposal'];
  const cap = 999999999999n; // < 10 billion major currency units; all calculations in integer cents.

  const parseCents = value => {
    const text = value.trim();
    if (!/^(?:0|[1-9]\d{0,9})(?:[.,]\d{1,2})?$/.test(text)) return null;
    const [major, decimals = ''] = text.replace(',', '.').split('.');
    const cents = BigInt(major) * 100n + BigInt(decimals.padEnd(2, '0'));
    return cents <= cap ? cents : null;
  };
  const formatMoney = cents => {
    const currency = controls.currency.value;
    const magnitude = cents < 0n ? -cents : cents;
    const whole = Number(magnitude / 100n);
    const fraction = (magnitude % 100n).toString().padStart(2, '0');
    return (cents < 0n ? '−' : '') + new Intl.NumberFormat('en-GB', {
      style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2
    }).format(whole + Number(fraction) / 100);
  };
  const clearOutput = () => {
    results.hidden = true;
    runway.textContent = '—';
    afterOutput.textContent = targetOutput.textContent = deltaOutput.textContent = '—';
    conclusion.textContent = '';
    meter.setAttribute('aria-valuenow', '0');
    bar.style.width = '0%';
  };
  const showStatus = (text, state, message) => {
    status.textContent = text;
    status.dataset.state = state;
    detail.textContent = message;
  };
  const evaluate = () => {
    clearOutput(); // Never show stale results for incomplete or modified inputs.
    const inputs = amountNames.map(name => controls[name].value.trim());
    const monthsText = controls.months.value.trim();
    if (inputs.some(s => !s) || !monthsText) {
      showStatus('NOT ASSESSED', 'neutral', 'Complete the four amounts and your own floor (1–36 months). Enter zero explicitly if appropriate.');
      return;
    }
    const amounts = inputs.map(parseCents);
    if (amounts.some(v => v === null) || !/^(?:[1-9]|[12]\d|3[0-6])$/.test(monthsText)) {
      showStatus('INVALID INPUT', 'hold', 'Use non-negative amounts without thousand separators, at most two decimals, and an integer floor from 1 to 36.');
      return;
    }
    const [cash, essentials, bills, proposed] = amounts;
    if (essentials <= 0n) {
      showStatus('INVALID INPUT', 'hold', 'Essential monthly expenses must be greater than zero.');
      return;
    }
    const months = BigInt(monthsText);
    const floor = essentials * months;
    const remaining = cash - bills - proposed;
    const delta = remaining - floor;
    const positiveRemaining = remaining > 0n ? remaining : 0n;
    const runwayTenths = positiveRemaining * 10n / essentials; // Always round runway down, never overstate.
    const boundedCoverage = floor > 0n ? positiveRemaining * 100n / floor : 0n;
    const coverage = Number(boundedCoverage > 100n ? 100n : boundedCoverage);
    runway.textContent = `${runwayTenths / 10n}.${runwayTenths % 10n}`;
    afterOutput.textContent = formatMoney(remaining);
    targetOutput.textContent = formatMoney(floor);
    deltaOutput.textContent = formatMoney(delta);
    meter.setAttribute('aria-valuenow', String(coverage));
    bar.style.width = coverage + '%';
    results.hidden = false;
    if (remaining < 0n) {
      showStatus('HOLD · CASH SHORTFALL', 'hold', 'Existing bills and the proposed outflow exceed your accessible cash.');
      conclusion.textContent = 'This is a modeled cash shortfall. Recheck existing commitments before considering any discretionary allocation.';
    } else if (delta < 0n) {
      showStatus('HOLD · BELOW YOUR FLOOR', 'hold', 'The proposed outflow would leave less than your own chosen reserve floor.');
      conclusion.textContent = 'Your chosen cash floor is not met. This is a planning hold—not a forecast or a prohibition on necessary spending.';
    } else {
      showStatus('FLOOR MET · REVIEW ONLY', 'review', 'This model meets the floor you selected. It does not authorize an investment or confirm financial safety.');
      conclusion.textContent = 'The arithmetic passes your selected floor. Separately review volatility of income, dependants, access delays, emergencies and other obligations.';
    }
  };
  const isProtection = () => new URLSearchParams(location.search).get('focus') === 'protect';
  const showForFocus = () => {
    const visible = isProtection();
    if (!visible && !root.hidden) {
      form.reset(); // A switch away from the vault erases personal amounts.
      evaluate();
    }
    root.hidden = !visible;
  };
  const reset = () => { form.reset(); evaluate(); };
  form.addEventListener('input', evaluate);
  form.addEventListener('change', evaluate);
  form.addEventListener('submit', event => event.preventDefault());
  root.querySelector('[data-vault-reset]').addEventListener('click', () => { reset(); controls.cash.focus(); });
  document.querySelectorAll('[data-mdr-focus]').forEach(button => button.addEventListener('click', showForFocus));
  window.addEventListener('popstate', showForFocus);
  window.addEventListener('pageshow', () => { reset(); showForFocus(); });
  // The entry link can target a section that was hidden during HTML parsing.
  showForFocus();
  if (isProtection() && location.hash === '#mdr-vault') {
    requestAnimationFrame(() => root.scrollIntoView({block:'start'}));
  }
  reset();
  // No localStorage, cookies, analytics, network calls or outside user-data access.
})();
