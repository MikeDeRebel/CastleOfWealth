(() => {
  const root = document.querySelector('[data-mdr-playbook]');
  if (!root) return;

  // These routes guide research; choosing one never approves or executes an action.
  const focuses = {
    foundations: {
      label: 'YOUR STARTING POINT / FOUNDATIONS',
      title: 'Define what freedom means to you.',
      description: 'A stronger castle starts with a clear purpose. Put your time horizon, responsibilities and boundaries on paper before choosing a tool.',
      steps: [
        ['Name the goal.', 'What would more independence let you do, protect or stop doing?'],
        ['Set your boundaries.', 'Separate the resources you need for everyday life from what you can put at risk.'],
        ['Choose one useful habit.', 'Write one small next step and a date to review it. Keep it simple enough to repeat.']
      ],
      output: 'Leave with: a purpose, clear boundaries and one next step.',
      href: 'guides.html#long-game',
      link: 'Read the long-game checklist'
    },
    research: {
      label: 'YOUR STARTING POINT / RESEARCH',
      title: 'Give the idea a case to answer.',
      description: 'Start with the bigger picture. Work from context to detail, separate observations from predictions, and actively look for evidence that could change your mind.',
      steps: [
        ['Write a testable thesis.', 'What do you expect, over what period, and what evidence would contradict it?'],
        ['Check the original sources.', 'Record where the information came from, when it was checked, and which questions are still open.'],
        ['Wait for your conditions.', 'Choose a clear trigger for action or further research. If it is missing, waiting is a complete decision.']
      ],
      output: 'Leave with: a thesis, contrary evidence and a condition for the next step.',
      href: '#mdr-falsifier',
      link: 'Open the MDR falsification record'
    },
    protect: {
      label: 'YOUR STARTING POINT / PROTECTION',
      title: 'Know what could breach the walls.',
      description: 'Look at what could fail before focusing on what could grow. Understand access, custody, costs, dependencies and the limit you are willing to accept.',
      steps: [
        ['Map the weak points.', 'Who controls access? What depends on a provider, a device, a protocol or one person?'],
        ['Define the limit in advance.', 'Write the downside you can accept and the condition that makes you stop. Keep essential resources outside that commitment.'],
        ['Check the way out.', 'Understand withdrawal conditions, recovery procedures and costs. Keep sensitive recovery information outside this page.']
      ],
      output: 'Leave with: a risk limit, a stop condition and an exit or recovery plan.',
      href: 'invest.html',
      link: 'Read the custody and risk context'
    },
    review: {
      label: 'YOUR STARTING POINT / REVIEW',
      title: 'Let your own record make you better.',
      description: 'History does not repeat; it often rhymes. Compare what you expected with what happened, and improve the process without rewriting the original decision.',
      steps: [
        ['Return to the original reasoning.', 'Read the evidence and limits you recorded before you knew the outcome. Was the process followed?'],
        ['Account for the whole outcome.', 'Include costs, time and mistakes. Separate added or withdrawn capital from gains and losses.'],
        ['Improve one thing.', 'Write one practical lesson, decide what changes next time, and choose the next review date.']
      ],
      output: 'Leave with: an honest review, one improvement and the next review date.',
      href: 'guides.html#long-game',
      link: 'Keep a useful long-term record'
    }
  };
  const focusButtons = [...root.querySelectorAll('[data-mdr-focus]')];
  let focus = 'foundations';
  const readFocus = () => {
    const value = new URLSearchParams(location.search).get('focus');
    return Object.hasOwn(focuses, value) ? value : 'foundations';
  };
  const showFocus = value => {
    focus = Object.hasOwn(focuses, value) ? value : 'foundations';
    const guide = focuses[focus];
    focusButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mdrFocus === focus)));
    root.querySelector('[data-focus-label]').textContent = guide.label;
    root.querySelector('[data-focus-title]').textContent = guide.title;
    root.querySelector('[data-focus-description]').textContent = guide.description;
    root.querySelector('[data-focus-output]').textContent = guide.output;
    const link = root.querySelector('[data-focus-link]');
    link.href = guide.href;
    link.textContent = guide.link + ' →';
    const steps = guide.steps.map(([title, description]) => {
      const item = document.createElement('li');
      const heading = document.createElement('strong');
      const body = document.createElement('span');
      heading.textContent = title;
      body.textContent = description;
      item.append(heading, body);
      return item;
    });
    root.querySelector('[data-focus-steps]').replaceChildren(...steps);
  };
  focusButtons.forEach(button => button.addEventListener('click', () => {
    if (button.dataset.mdrFocus === focus) return;
    const url = new URL(location.href);
    url.searchParams.set('focus', button.dataset.mdrFocus);
    history.pushState(null, '', url);
    showFocus(button.dataset.mdrFocus);
  }));
  window.addEventListener('popstate', () => showFocus(readFocus()));
  showFocus(readFocus());
  root.querySelector('[data-focus-options]').hidden = false;

  const form = root.querySelector('[data-decision-form]');
  if (!form) return;
  const storageKey = 'cow.mdr.playbook.v1';
  const fieldNames = ['decision', 'evidence', 'risk', 'action', 'reviewDate', 'lesson'];
  const fields = Object.fromEntries(fieldNames.map(name => [name, form.elements.namedItem(name)]));
  const verdict = form.elements.namedItem('verdict');
  const approved = form.elements.namedItem('approved');
  const remember = form.elements.namedItem('remember');
  const status = form.querySelector('[data-decision-status]');
  const storageStatus = form.querySelector('[data-storage-status]');
  const downloadStatus = form.querySelector('[data-download-status]');
  const verdictLabels = { research: 'Research more', wait: 'Wait', proceed: 'Proceed with my plan', decline: 'Decline' };
  let approvedAt = null;

  const snapshot = () => ({
    version: 1,
    fields: Object.fromEntries(fieldNames.map(name => [name, fields[name].value])),
    verdict: verdict.value
  });
  const isPrepared = () => ['decision', 'evidence', 'risk', 'action'].every(name => fields[name].value.trim()) &&
    Boolean(fields.reviewDate.value) && fields.reviewDate.validity.valid;
  const renderStatus = () => {
    const canApprove = verdict.value === 'proceed' && isPrepared();
    approved.disabled = !canApprove;
    if (!canApprove) { approved.checked = false; approvedAt = null; }
    const hasContent = fieldNames.some(name => fields[name].value.trim());
    const statuses = { research: 'Research in progress', wait: 'Waiting by choice', decline: 'Decision declined' };
    status.textContent = approved.checked ? 'Approved by you' : canApprove ? 'Ready for your review' :
      verdict.value === 'proceed' || (!hasContent && verdict.value === 'research') ? 'Preparation in progress' : statuses[verdict.value];
    status.dataset.approved = String(approved.checked);
  };
  const saveDraft = () => {
    if (!remember.checked) return;
    try {
      // Approval is intentionally absent: a restored plan requires fresh review.
      localStorage.setItem(storageKey, JSON.stringify(snapshot()));
      storageStatus.textContent = 'Saved on this device. Approval is always reviewed again when you return.';
    } catch {
      storageStatus.textContent = 'This browser could not save the card. Keep this page open or download a copy.';
    }
  };
  const removeDraft = () => {
    try {
      localStorage.removeItem(storageKey);
      storageStatus.textContent = 'Not saved. Download a copy to keep your record.';
    } catch {
      storageStatus.textContent = 'The saved copy could not be removed. Clear this site’s data in your browser settings to remove it.';
    }
  };
  const invalidateApproval = () => {
    approved.checked = false;
    approvedAt = null;
    downloadStatus.textContent = '';
    renderStatus();
  };

  // Reset browser-restored controls, then restore only explicitly remembered fields.
  form.reset();
  let saved = null;
  try { saved = localStorage.getItem(storageKey); }
  catch {
    remember.disabled = true;
    storageStatus.textContent = 'Device storage is unavailable. You can still write, review and download this card.';
  }
  if (saved) {
    try {
      const draft = JSON.parse(saved);
      if (draft?.version !== 1 || !draft.fields || typeof draft.fields !== 'object') throw new Error('Unknown draft');
      fieldNames.forEach(name => {
        if (typeof draft.fields[name] === 'string') {
          fields[name].value = draft.fields[name].slice(0, fields[name].maxLength > 0 ? fields[name].maxLength : 10);
        }
      });
      verdict.value = Object.hasOwn(verdictLabels, draft.verdict) ? draft.verdict : 'research';
      remember.checked = true;
      storageStatus.textContent = 'Restored from this device. Review the current plan before approving it again.';
    } catch {
      storageStatus.textContent = 'The saved card could not be read. You can start a new card or download your current work.';
    }
  }
  invalidateApproval();
  form.addEventListener('submit', event => event.preventDefault());
  fieldNames.concat('verdict').forEach(name => {
    const control = form.elements.namedItem(name);
    const changed = () => { invalidateApproval(); saveDraft(); };
    control.addEventListener('input', changed);
    control.addEventListener('change', changed);
  });
  approved.addEventListener('change', () => {
    approvedAt = approved.checked ? new Date().toISOString() : null;
    downloadStatus.textContent = '';
    renderStatus();
  });
  remember.addEventListener('change', () => {
    if (remember.checked) saveDraft();
    else removeDraft();
  });
  // A page restored from the back/forward cache also needs fresh human review.
  window.addEventListener('pageshow', invalidateApproval);

  form.querySelector('[data-clear-decision]').addEventListener('click', () => {
    if (!window.confirm('Clear this decision card and its saved copy on this device? Download it first if you want to keep the record.')) return;
    removeDraft();
    form.reset();
    invalidateApproval();
    fields.decision.focus();
  });
  form.querySelector('[data-download-decision]').addEventListener('click', () => {
    renderStatus();
    const labels = {
      decision: 'WHAT AM I DECIDING?',
      evidence: 'EVIDENCE & ALTERNATIVES',
      risk: 'RISK & INVALIDATION',
      action: 'MY NEXT SMALL STEP',
      reviewDate: 'REVIEW ON',
      lesson: 'AFTER THE REVIEW'
    };
    const now = new Date();
    const lines = [
      'THE MDR PLAYBOOK — CASTLE OF WEALTH',
      'A personal decision record · Method by MikeDeRebel',
      'Preparation beats prediction.',
      '',
      'Exported: ' + now.toISOString(),
      'Focus: ' + focuses[focus].title,
      'Decision: ' + verdictLabels[verdict.value],
      'Status: ' + status.textContent,
      'Human approval: ' + (approved.checked ? 'Recorded by you at ' + approvedAt : 'Not recorded'),
      '',
      ...fieldNames.flatMap(name => [labels[name], fields[name].value || 'Not recorded', '']),
      'This card records your reasoning and your own approval. It does not assess or approve an investment, place orders or execute an action.',
      'Keep the original record. Compare the outcome at your review.',
      'https://derebel.be/links.html'
    ];
    const blob = new Blob([lines.join('\n') + '\n'], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mdr-decision-' + now.toISOString().slice(0, 10) + '.txt';
    link.hidden = true;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    downloadStatus.textContent = 'Download prepared. Keep this copy for your next review.';
  });
  form.hidden = false;
})();
