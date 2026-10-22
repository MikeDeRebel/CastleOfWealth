(() => {
  'use strict';
  const gate = document.querySelector('[data-mdr-entry-gate]');
  if (!gate) return;
  const checks = [...gate.querySelectorAll('[data-mdr-gate-check]')];
  const controls = gate.querySelector('[data-mdr-gate-controls]');
  const status = gate.querySelector('[data-mdr-gate-status]');
  const hint = gate.querySelector('[data-mdr-gate-hint]');
  const count = gate.querySelector('[data-mdr-gate-count]');
  const progress = gate.querySelector('[role="progressbar"]');
  const bar = gate.querySelector('[data-mdr-gate-bar]');
  const reset = gate.querySelector('[data-mdr-gate-reset]');
  if (!controls || !status || !hint || !count || !progress || !bar || !reset || checks.length !== 3) return;

  // This is a manual self-check, not an assessment of live broker or market data.
  const missing = [
    'Map the weekly, daily and 4H context first.',
    'Wait for 15m → 5m structure confirmation.',
    'Write your stop, invalidation and fixed-R risk before any action.'
  ];
  const update = () => {
    const completed = checks.filter(check => check.checked).length;
    const canReview = completed === checks.length;
    gate.dataset.state = canReview ? 'review' : 'stand-down';
    status.textContent = canReview ? 'CANDIDATE / HUMAN REVIEW REQUIRED' : `STAND DOWN / ${completed} OF 3 CHECKED`;
    hint.textContent = canReview
      ? 'Self-check complete. Record the decision and approve it yourself; no trade is authorised here.'
      : missing[checks.findIndex(check => !check.checked)];
    count.textContent = `${String(completed).padStart(2, '0')} / 03`;
    progress.setAttribute('aria-valuenow', String(completed));
    bar.style.width = `${(completed / checks.length) * 100}%`;
    reset.disabled = completed === 0;
  };
  // A market checklist must not retain stale confirmations across visits.
  checks.forEach(check => { check.checked = false; });
  controls.disabled = false;
  checks.forEach(check => check.addEventListener('change', update));
  reset.addEventListener('click', () => {
    checks.forEach(check => { check.checked = false; });
    update();
    checks[0].focus();
  });
  // Never trust browser-restored checkbox state as approval.
  window.addEventListener('pageshow', () => {
    checks.forEach(check => { check.checked = false; });
    update();
  });
  update();
})();
