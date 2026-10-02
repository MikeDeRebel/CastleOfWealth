(() => {
  const root = document.querySelector('[data-links-root]');
  if (!root) return;
  const grid = root.querySelector('[data-links-grid]');
  const filters = root.querySelector('[data-filters]');
  const search = root.querySelector('[data-links-search]');
  const status = root.querySelector('[data-links-status]');
  const categories = ['All', 'CEX', 'DEX', 'Earn', 'Tools', 'Ecosystems', 'Social'];
  const requested = new URLSearchParams(location.search).get('category');
  let category = categories.includes(requested) ? requested : 'All';
  let links = [];

  const element = (tag, text, className) => {
    const node = document.createElement(tag);
    if (text != null) node.textContent = text;
    if (className) node.className = className;
    return node;
  };

  // JSON is content, never HTML or executable navigation.
  const safeURL = value => {
    if (typeof value !== 'string' || !value.trim()) return null;
    try {
      const url = new URL(value, document.baseURI);
      return ['https:', 'http:'].includes(url.protocol) ? url : null;
    } catch {
      return null;
    }
  };

  const render = () => {
    const query = search.value.trim().toLowerCase();
    const visible = links.filter(item =>
      (category === 'All' || item.category === category) &&
      [item.name, item.description, item.subCategory].some(value =>
        String(value || '').toLowerCase().includes(query)
      )
    );
    grid.replaceChildren();
    status.textContent = visible.length + ' resources' + (category !== 'All' ? ' in ' + category : '');
    // Keep the buttons themselves intact so keyboard focus survives filtering.
    filters.querySelectorAll('button').forEach(button => {
      const active = button.textContent === category;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    for (const item of visible) {
      const card = element('article', null, 'card link-card');
      card.append(element('h2', item.name));
      const meta = element('div', null, 'card-meta');
      const labels = [item.category, item.subCategory, 'Risk: ' + (item.risk || 'Not specified'),
        ...(item.referral ? ['Referral'] : [])];
      for (const label of labels) {
        if (label) meta.append(element('span', label, 'pill'));
      }
      card.append(meta, element('p', item.description || 'Verify details with the original provider.'));
      const link = element('a', item.cta || 'Open ' + item.name + ' ↗');
      link.href = item.safeURL.href;
      if (item.safeURL.origin !== location.origin) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }
      card.append(link);
      grid.append(card);
    }
    if (!visible.length) {
      grid.append(element('p', 'No matching resources. Try another search or category.', 'empty-state'));
    }
  };

  for (const name of categories) {
    const button = element('button', name, 'filter-btn');
    button.type = 'button';
    button.addEventListener('click', () => {
      category = name;
      const url = new URL(location.href);
      if (name === 'All') url.searchParams.delete('category');
      else url.searchParams.set('category', name);
      history.replaceState(null, '', url);
      render();
    });
    filters.append(button);
  }
  search.addEventListener('input', render);

  const load = async () => {
    status.textContent = 'Loading resources…';
    grid.replaceChildren(element('p', 'Loading platform links…', 'empty-state'));
    try {
      const response = await fetch(root.dataset.source || 'data/links.json');
      if (!response.ok) throw new Error('Directory unavailable');
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('Invalid directory');
      links = data.filter(item => item && typeof item.name === 'string').map(item => ({
        ...item,
        category: categories.includes(item.category) && item.category !== 'All' ? item.category : 'Tools',
        safeURL: safeURL(item.url)
      })).filter(item => item.safeURL);
      render();
    } catch {
      status.textContent = 'Resources could not be loaded.';
      const box = element('div', null, 'empty-state');
      box.append(element('p', 'The directory is temporarily unavailable. Try loading it again.'));
      const retry = element('button', 'Try again', 'button');
      retry.type = 'button';
      retry.addEventListener('click', load);
      box.append(retry);
      grid.replaceChildren(box);
    }
  };
  load();
})();
