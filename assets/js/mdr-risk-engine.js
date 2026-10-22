(() => {
  'use strict';
  const root = document.querySelector('[data-mdr-risk-engine]');
  if (!root) return;
  const form = root.querySelector('[data-mdr-risk-form]');
  const outputs = Object.fromEntries(['state', 'message', 'quantity', 'budget', 'loss', 'distance', 'notional', 'friction', 'exposure', 'usage', 'bar', 'warning']
    .map(name => [name, root.querySelector('[data-r-' + name + ']')]));
  const controls = Object.fromEntries(['side','currency','equity','riskPercent','entry','stop','entryFee','exitFee','slippage','maxExposure']
    .map(name => [name, form.elements.namedItem(name)]));
  const SCALE = 10n ** 12n; // Exact decimal inputs up to 12 places.
  const UNITS = 10n ** 8n;  // Venue-neutral eight-decimal quantity ticks.
  const ceil = (a, b) => (a + b - 1n) / b;
  const minimum = (a, b) => a < b ? a : b;
  const dash = '—';
  const integerWithCommas = value => value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const money = (scaled, currency) => {
    const cents = (scaled * 100n + SCALE / 2n) / SCALE;
    return integerWithCommas(cents / 100n) + '.' + (cents % 100n).toString().padStart(2, '0') + ' ' + currency;
  };
  const percentage = (numerator, denominator) => {
    if (denominator <= 0n) return dash;
    const thousandths = (numerator * 100000n + denominator / 2n) / denominator;
    const decimals = (thousandths % 1000n).toString().padStart(3, '0').replace(/0+$/, '');
    return (thousandths / 1000n).toString() + (decimals ? '.' + decimals : '') + '%';
  };
  const multiple = (numerator, denominator) => {
    const hundredths = (numerator * 100n + denominator / 2n) / denominator;
    return (hundredths / 100n).toString() + '.' + (hundredths % 100n).toString().padStart(2, '0') + '×';
  };
  const quantityText = ticks => (ticks / UNITS).toString() + '.' + (ticks % UNITS).toString().padStart(8, '0');
  const resetOutput = message => {
    outputs.state.textContent = 'STAND DOWN';
    outputs.state.dataset.ready = 'false';
    outputs.message.textContent = message;
    ['quantity','budget','loss','distance','notional','friction','exposure','usage'].forEach(key => outputs[key].textContent = dash);
    outputs.bar.style.width = '0%';
    outputs.warning.textContent = '⛔ No trade approval. Review the MDR decision card before any action.';
  };
  const decimal = (name, minimumAllowed, maximumAllowed) => {
    const el = controls[name];
    const value = el.value.trim();
    if (!value || !el.validity.valid || !/^\d+(?:\.\d{1,12})?$/.test(value)) return null;
    const [whole, fraction = ''] = value.split('.');
    const scaled = BigInt(whole) * SCALE + BigInt(fraction.padEnd(12, '0') || '0');
    return scaled >= minimumAllowed && scaled <= maximumAllowed ? scaled : null;
  };
  const atLeast = value => BigInt(value) * SCALE;
  const calculate = () => {
    const inputs = {
      equity: decimal('equity', SCALE / 100n, atLeast(1000000000000)),
      riskPercent: decimal('riskPercent', SCALE / 100n, atLeast(10)),
      entry: decimal('entry', SCALE / 100000000n, atLeast(1000000000000)),
      stop: decimal('stop', SCALE / 100000000n, atLeast(1000000000000)),
      entryFee: decimal('entryFee', 0n, atLeast(5)),
      exitFee: decimal('exitFee', 0n, atLeast(5)),
      slippage: decimal('slippage', 0n, atLeast(5)),
      maxExposure: decimal('maxExposure', SCALE / 10n, atLeast(20))
    };
    if (Object.values(inputs).some(value => value === null)) {
      resetOutput('Enter all assumptions, including both fees and slippage. Use plain decimals (up to 12 places). Risk 0.01–10%; fees/buffer 0–5%; maximum notional 0.1–20×.');
      return;
    }
    const { equity, riskPercent, entry, stop, entryFee, exitFee, slippage, maxExposure } = inputs;
    const long = controls.side.value === 'long';
    if ((long && stop >= entry) || (!long && stop <= entry)) {
      resetOutput(long ? 'Invalid long plan: stop must be below entry. STAND DOWN.' : 'Invalid short plan: stop must be above entry. STAND DOWN.');
      return;
    }
    // Conservative rounding: budget down; each loss and cost up; quantity down.
    const riskBudget = equity * riskPercent / (100n * SCALE);
    const distance = long ? entry - stop : stop - entry;
    const adverseSlip = ceil(stop * slippage, 100n * SCALE);
    // Charge the exit fee on (stop + slippage) for BOTH directions:
    // this includes fee-on-slippage for shorts and is conservative for longs.
    const friction = ceil(entry * entryFee, 100n * SCALE) +
      adverseSlip + ceil((stop + adverseSlip) * exitFee, 100n * SCALE);
    const lossPerUnit = distance + friction;
    const maxNotional = equity * maxExposure / SCALE;
    if (riskBudget <= 0n || lossPerUnit <= 0n || entry <= 0n) {
      resetOutput('No measurable risk budget or stop distance. STAND DOWN.');
      return;
    }
    const riskSized = riskBudget * UNITS / lossPerUnit;
    const capSized = maxNotional * UNITS / entry;
    const quantity = minimum(riskSized, capSized);
    if (quantity <= 0n) {
      resetOutput('The modeled quantity falls below 0.00000001 unit. STAND DOWN.');
      return;
    }
    if (quantity > 100000000n * UNITS) {
      resetOutput('The quantity exceeds this public eight-decimal model’s scope (100 million units). STAND DOWN.');
      return;
    }
    const modeledLoss = ceil(quantity * lossPerUnit, UNITS);
    const notional = ceil(quantity * entry, UNITS);
    if (modeledLoss > riskBudget || notional > maxNotional) {
      resetOutput('A numerical risk bound failed. STAND DOWN.');
      return;
    }
    const currency = controls.currency.value;
    outputs.state.textContent = 'MODEL CALCULATED';
    outputs.state.dataset.ready = 'true';
    outputs.message.textContent = 'Calculated under your assumptions. This is not a trade setup, broker approval or guaranteed stop fill.';
    outputs.quantity.textContent = quantityText(quantity);
    outputs.budget.textContent = money(riskBudget, currency);
    outputs.loss.textContent = money(modeledLoss, currency);
    outputs.distance.textContent = percentage(distance, entry);
    outputs.notional.textContent = money(notional, currency);
    outputs.friction.textContent = money(friction, currency);
    outputs.exposure.textContent = multiple(notional, equity);
    outputs.usage.textContent = percentage(modeledLoss, riskBudget);
    outputs.bar.style.width = (Number(modeledLoss * 10000n / riskBudget) / 100).toString() + '%';
    if (notional > equity) {
      outputs.warning.textContent = '⚠️ Exposure exceeds equity. Margin, liquidation and funding are not modeled; your stop may not limit the actual loss.';
    } else if (riskSized > capSized) {
      outputs.warning.textContent = '⌁ Notional cap applied. Modeled loss is below your 1R budget. Verify lot sizes, costs and stop execution independently.';
    } else {
      outputs.warning.textContent = '⌁ Within your chosen notional cap. Gaps, stop execution and unmodeled costs can produce larger losses.';
    }
  };
  form.addEventListener('submit', event => event.preventDefault());
  form.addEventListener('input', calculate);
  form.addEventListener('change', calculate);
  form.addEventListener('reset', () => queueMicrotask(calculate));
  // No storage, account access, API calls, or persisted approvals.
  form.reset();
  form.hidden = false;
  calculate();
  window.addEventListener('pageshow', event => {
    if (!event.persisted) return;
    form.reset();
    calculate();
  });
})();
