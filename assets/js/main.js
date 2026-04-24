(() => {
  const linksRoot = document.querySelector('[data-links-root]');
  if (!linksRoot) return;

  const grid = linksRoot.querySelector('[data-links-grid]');
  const filtersHost = linksRoot.querySelector('[data-filters]');
  const source = linksRoot.getAttribute('data-source') || 'data/links.json';
  const supportedCategories = ['All', 'CEX', 'DEX', 'Earn', 'Tools', 'Ecosystems', 'Social'];
  let activeCategory = 'All';
  let links = [];

  const sanitizeCategory = (category) => {
    if (!category) return 'Tools';
    const normalized = category.trim();
    if (supportedCategories.includes(normalized)) return normalized;

    if (normalized === 'Wallet' || normalized === 'DeFi' || normalized === 'L1/L2') return 'Ecosystems';
    return 'Tools';
  };

  const createFilters = () => {
    filtersHost.innerHTML = '';
    supportedCategories.forEach((category) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `filter-btn${category === activeCategory ? ' active' : ''}`;
      btn.textContent = category;
      btn.dataset.filter = category;
      btn.addEventListener('click', () => {
        activeCategory = category;
        createFilters();
        renderCards();
      });
      filtersHost.appendChild(btn);
    });
  };

  const cardTemplate = (item) => {
    const risk = item.risk || 'High';
    const region = item.region || 'Global';

    return `
      <article class="card link-card">
        <div class="link-title">
          <h3>${item.name}</h3>
          ${item.highlight ? '<span class="badge highlight">Featured</span>' : ''}
          ${item.referral ? '<span class="badge referral">Referral</span>' : ''}
        </div>
        <p>${item.description || ''}</p>
        <div class="badge-row">
          <span class="badge">${item.category}</span>
          <span class="badge">${item.subCategory || 'General'}</span>
          <span class="badge">${region}</span>
          <span class="badge">Risk: ${risk}</span>
        </div>
        <p>
          <a class="button" href="${item.url}" target="_blank" rel="noopener noreferrer">Visit ${item.name}</a>
        </p>
      </article>
    `;
  };

  const renderCards = () => {
    const filtered = activeCategory === 'All'
      ? links
      : links.filter((item) => item.category === activeCategory);

    if (!filtered.length) {
      grid.innerHTML = '<div class="empty-state">No platforms found for this filter yet.</div>';
      return;
    }

    grid.innerHTML = filtered.map(cardTemplate).join('');
  };

  const normalizeLinks = (data) => data.map((item) => ({
    ...item,
    category: sanitizeCategory(item.category),
    risk: item.risk || 'High'
  }));

  fetch(source)
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to load links: ${res.status}`);
      return res.json();
    })
    .then((data) => {
      if (!Array.isArray(data)) throw new Error('links.json must be an array');
      links = normalizeLinks(data);
      createFilters();
      renderCards();
    })
    .catch((err) => {
      console.error(err);
      grid.innerHTML = '<div class="empty-state">Could not load links data. Try again later.</div>';
    });
})();
