// /work filtering. PRD v2 phase 2.
//
// This module no longer BUILDS the page — scripts/build-work.mjs
// pre-renders the chips and the type-grouped card list as real DOM. That
// was the fix for /work's 0.079 CLS: previously #work-app shipped empty
// and everything landed after first paint. Now nothing is injected on
// load; this only attaches behaviour to elements that already exist and
// filters by hiding them, so the only layout changes are user-initiated
// (which don't count toward CLS) and a JS-disabled visitor still gets
// the complete list with no separate <noscript> copy to keep in sync.

const app = document.getElementById('work-app');

if (app) {
  const chips = [...app.querySelectorAll('.chip')];
  const cards = [...app.querySelectorAll('.work-card')];
  const groups = [...app.querySelectorAll('.work-group')];
  const count = app.querySelector('.work-count');
  const total = count ? Number(count.dataset.total) : cards.length;

  const state = { domain: null, capability: null };

  function readUrl() {
    const p = new URLSearchParams(window.location.search);
    const d = p.get('domain');
    const c = p.get('capability');
    state.domain = chips.some((x) => x.dataset.kind === 'domain' && x.dataset.slug === d) ? d : null;
    state.capability = chips.some((x) => x.dataset.kind === 'capability' && x.dataset.slug === c) ? c : null;
  }

  function writeUrl(replace) {
    const p = new URLSearchParams();
    if (state.domain) p.set('domain', state.domain);
    if (state.capability) p.set('capability', state.capability);
    const q = p.toString();
    const url = window.location.pathname + (q ? `?${q}` : '');
    if (replace) window.history.replaceState({ ...state }, '', url);
    else window.history.pushState({ ...state }, '', url);
  }

  function matches(card) {
    if (state.domain && card.dataset.domain !== state.domain) return false;
    if (state.capability && !card.dataset.capabilities.split(' ').includes(state.capability)) return false;
    return true;
  }

  function render() {
    chips.forEach((chip) => {
      const on = state[chip.dataset.kind] === chip.dataset.slug;
      chip.setAttribute('aria-pressed', on ? 'true' : 'false');
    });

    let shown = 0;
    cards.forEach((card) => {
      const ok = matches(card);
      card.hidden = !ok;
      if (ok) shown++;
    });

    // A group with nothing left in it is hidden entirely rather than
    // left as an empty heading.
    groups.forEach((group) => {
      const any = [...group.querySelectorAll('.work-card')].some((c) => !c.hidden);
      group.hidden = !any;
    });

    if (count) {
      if (!state.domain && !state.capability) {
        count.textContent = `Showing all ${total} engagements`;
      } else if (shown === 0) {
        const active = [state.domain, state.capability].filter(Boolean).length;
        count.textContent = active > 1
          ? 'No engagement matches both filters. Try clearing one.'
          : 'No engagement matches that filter yet.';
      } else {
        count.textContent = `Showing ${shown} of ${total} engagements`;
      }
    }
  }

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const kind = chip.dataset.kind;
      state[kind] = state[kind] === chip.dataset.slug ? null : chip.dataset.slug;
      writeUrl(false);
      render();
      // Focus stays on the chip the visitor pressed — nothing is
      // rebuilt, so there is no focus to restore.
    });
  });

  window.addEventListener('popstate', () => {
    readUrl();
    render();
  });

  readUrl();
  writeUrl(true);
  render();
}
