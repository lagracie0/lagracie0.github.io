import { DOMAINS, CAPABILITIES, LISTED_CASES } from '../data/cases.js';
import { displayLabel, displayDateRange } from './case-utils.js';

const domainBySlug = new Map(DOMAINS.map((d) => [d.slug, d]));
const capabilityBySlug = new Map(CAPABILITIES.map((c) => [c.slug, c]));

// Most recent first — PRD v2 dropped v1's P0/P1 launch-list distinction,
// so recency is the whole ordering. "Recent" uses dateEnd, falling back
// to dateStart, falling back to last. Date strings compare fine
// lexicographically even at mixed precision (year-only vs year-month-day)
// for this purpose: exact day-level ordering isn't the point, keeping
// dated work ahead of undated work is.
function recencyKey(caseObj) {
  return caseObj.dateEnd || caseObj.dateStart || null;
}

function orderForWork(cases) {
  return [...cases].sort((a, b) => {
    const ka = recencyKey(a);
    const kb = recencyKey(b);
    if (ka === null && kb === null) return 0;
    if (ka === null) return 1;
    if (kb === null) return -1;
    return kb.localeCompare(ka);
  });
}

function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(props).forEach(([key, value]) => {
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key.startsWith('data-') || key.startsWith('aria-')) node.setAttribute(key, value);
    else node[key] = value;
  });
  children.forEach((c) => node.appendChild(c));
  return node;
}

function readStateFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const domain = params.get('domain');
  const capability = params.get('capability');
  return {
    domain: domain && domainBySlug.has(domain) ? domain : null,
    capability: capability && capabilityBySlug.has(capability) ? capability : null,
  };
}

function writeStateToUrl(state, replace) {
  const params = new URLSearchParams();
  if (state.domain) params.set('domain', state.domain);
  if (state.capability) params.set('capability', state.capability);
  const query = params.toString();
  const url = window.location.pathname + (query ? `?${query}` : '');
  if (replace) window.history.replaceState(state, '', url);
  else window.history.pushState(state, '', url);
}

function matchingCases(state) {
  return orderForWork(LISTED_CASES.filter((c) =>
    (!state.domain || c.domain === state.domain) &&
    (!state.capability || c.capabilities.includes(state.capability))
  ));
}

function buildCard(caseObj) {
  const tags = el('ul', { class: 'card-tags' },
    caseObj.capabilities.map((slug) => el('li', { text: capabilityBySlug.get(slug).label }))
  );
  const dateText = displayDateRange(caseObj);
  return el('a', { class: 'case-card', href: `${caseObj.slug}/` }, [
    el('p', { class: 'card-title', text: caseObj.title }),
    el('p', { class: 'card-org', text: dateText ? `${displayLabel(caseObj)} · ${dateText}` : displayLabel(caseObj) }),
    tags,
  ]);
}

function init() {
  const root = document.getElementById('work-app');
  if (!root) return;

  let state = readStateFromUrl();

  const chipsSection = el('div', { class: 'filters' });
  const domainRow = el('div', { class: 'filter-row' });
  domainRow.appendChild(el('span', { class: 'filter-row-label', text: 'Domain' }));
  const domainScroll = el('div', { class: 'chip-scroll', role: 'group', 'aria-label': 'Filter by domain' });
  domainRow.appendChild(domainScroll);

  const capabilityRow = el('div', { class: 'filter-row' });
  capabilityRow.appendChild(el('span', { class: 'filter-row-label', text: 'Capability' }));
  const capabilityScroll = el('div', { class: 'chip-scroll', role: 'group', 'aria-label': 'Filter by capability' });
  capabilityRow.appendChild(capabilityScroll);

  chipsSection.appendChild(domainRow);
  chipsSection.appendChild(capabilityRow);

  const activeFiltersRow = el('div', { class: 'active-filters' });
  const listContainer = el('div', { class: 'work-list' });

  function setState(next, replace) {
    state = next;
    writeStateToUrl(state, replace);
    renderAll();
  }

  function makeChip(slug, labelText, isActive, onToggle) {
    const chip = el('button', { class: 'chip', type: 'button', text: labelText, 'data-slug': slug, 'aria-pressed': isActive ? 'true' : 'false' });
    chip.addEventListener('click', onToggle);
    return chip;
  }

  // Rebuilding the chip row on every filter change used to drop keyboard
  // focus to <body> — replaceChildren() destroys the button the user just
  // activated, and nothing put focus back anywhere. A keyboard user who
  // filtered lost their place and had to Tab from the top of the page
  // again. Now: note which chip (if any) had focus before the rebuild, and
  // restore focus to its replacement by data-slug after.
  function renderChips() {
    const focused = document.activeElement;
    const focusedSlug = (focused && focused.closest('.chip-scroll')) ? focused.dataset.slug : null;
    const focusedScroll = focusedSlug
      ? (focused.closest('.chip-scroll') === domainScroll ? 'domain' : 'capability')
      : null;

    domainScroll.replaceChildren(
      ...DOMAINS.map((d) => makeChip(d.slug, d.label, state.domain === d.slug, () =>
        setState({ ...state, domain: state.domain === d.slug ? null : d.slug })
      ))
    );
    capabilityScroll.replaceChildren(
      ...CAPABILITIES.map((c) => makeChip(c.slug, c.label, state.capability === c.slug, () =>
        setState({ ...state, capability: state.capability === c.slug ? null : c.slug })
      ))
    );

    if (focusedSlug) {
      const scroll = focusedScroll === 'domain' ? domainScroll : capabilityScroll;
      const replacement = scroll.querySelector(`[data-slug="${focusedSlug}"]`);
      if (replacement) replacement.focus();
    }
  }

  function renderActiveFilters() {
    const pills = [];
    if (state.domain) {
      pills.push(el('button', { class: 'filter-pill', type: 'button' }, [
        document.createTextNode(domainBySlug.get(state.domain).label + ' '),
        el('span', { class: 'remove-x', text: '×' }),
      ]));
      pills[pills.length - 1].addEventListener('click', () => setState({ ...state, domain: null }));
    }
    if (state.capability) {
      pills.push(el('button', { class: 'filter-pill', type: 'button' }, [
        document.createTextNode(capabilityBySlug.get(state.capability).label + ' '),
        el('span', { class: 'remove-x', text: '×' }),
      ]));
      pills[pills.length - 1].addEventListener('click', () => setState({ ...state, capability: null }));
    }

    if (pills.length === 0) {
      activeFiltersRow.replaceChildren(el('span', { class: 'active-filters-label', text: 'No filters applied — showing all cases' }));
      return;
    }

    const clearAll = el('button', { class: 'clear-all', type: 'button', text: 'Clear all' });
    clearAll.addEventListener('click', () => setState({ domain: null, capability: null }));
    activeFiltersRow.replaceChildren(
      el('span', { class: 'active-filters-label', text: 'Filtered by:' }),
      ...pills,
      clearAll
    );
  }

  function renderList() {
    const matches = matchingCases(state);

    if (matches.length === 0) {
      const parts = [];
      if (state.domain && state.capability) {
        const domainMatches = LISTED_CASES.filter((c) => c.domain === state.domain).map((c) => capabilityBySlug.get(c.capabilities[0])?.label);
        const capMatches = DOMAINS.filter((d) => LISTED_CASES.some((c) => c.domain === d.slug && c.capabilities.includes(state.capability)));
        parts.push(el('p', { text: `No case combines ${domainBySlug.get(state.domain).label} with ${capabilityBySlug.get(state.capability).label}.` }));
        if (capMatches.length) {
          parts.push(el('p', { class: 'adjacent-list', text: `${capabilityBySlug.get(state.capability).label} shows up in: ${capMatches.map((d) => d.label).join(', ')}.` }));
        }
        const domainCaps = [...new Set(LISTED_CASES.filter((c) => c.domain === state.domain).flatMap((c) => c.capabilities))];
        if (domainCaps.length) {
          parts.push(el('p', { class: 'adjacent-list', text: `${domainBySlug.get(state.domain).label} covers: ${domainCaps.map((s) => capabilityBySlug.get(s).label).join(', ')}.` }));
        }
      } else {
        parts.push(el('p', { text: 'No cases match this filter yet.' }));
      }
      listContainer.replaceChildren(el('div', { class: 'work-empty' }, parts));
      return;
    }

    listContainer.replaceChildren(...matches.map(buildCard));
  }

  function renderAll() {
    renderChips();
    renderActiveFilters();
    renderList();
  }

  window.addEventListener('popstate', () => {
    state = readStateFromUrl();
    renderAll();
  });

  writeStateToUrl(state, true);
  root.appendChild(chipsSection);
  root.appendChild(activeFiltersRow);
  root.appendChild(listContainer);
  renderAll();
}

init();
