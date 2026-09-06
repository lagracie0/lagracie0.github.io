// Generates static work/{slug}/index.html for every LISTED case in
// data/cases.js. Run: node scripts/build-case-pages.mjs
//
// PRD v2 replaced v1's mandatory six-block schema with four adaptive
// templates (see TEMPLATES in data/cases.js). What that changes here:
//
// - A case declares a template; its section headings must match that
//   template exactly, in order. This script enforces that and refuses to
//   build otherwise, which is what stops a case quietly drifting into a
//   shape nothing else on the site expects.
// - There is no partial state any more. v1 rendered [NEEDS INPUT]
//   markers and a draft banner for unfinished cases; v2 says a case is
//   either written or it is not listed, so `listed: false` cases are
//   skipped entirely — no page, no card, no link — and nothing
//   provisional is ever rendered publicly.
// - RAG outcome badges are gone with the Outcome block that carried
//   them. Colour now keys to engagement type, not status (PRD v2 §7).
//
// --allow-drafts still exists for the deploy pipeline: it reports
// problems and exits 0 instead of failing the build. Local runs keep the
// non-zero exit, which is the guard against shipping a broken case.

import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { DOMAINS, CAPABILITIES, CASES, TEMPLATES } from '../data/cases.js';
import { displayLabel, displayDateRange } from '../js/case-utils.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const ALLOW_DRAFTS = process.argv.includes('--allow-drafts');

const domainLabel = new Map(DOMAINS.map((d) => [d.slug, d.label]));
const capabilityLabel = new Map(CAPABILITIES.map((c) => [c.slug, c.label]));

const listedCases = CASES.filter((c) => c.listed !== false);
const unlistedCases = CASES.filter((c) => c.listed === false);

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// A listed case must match its template's headings exactly and have real
// prose in every section. Anything else is a build error, not something
// to paper over at render time.
function validate(caseObj) {
  const problems = [];
  const template = TEMPLATES[caseObj.template];

  if (!template) {
    problems.push(`unknown template "${caseObj.template}" (expected one of ${Object.keys(TEMPLATES).join(', ')})`);
    return problems;
  }

  const actual = (caseObj.sections || []).map((s) => s.heading);
  const expected = template.headings;
  if (actual.length !== expected.length || actual.some((h, i) => h !== expected[i])) {
    problems.push(
      `section headings don't match template ${caseObj.template} (${template.label}).\n` +
      `      expected: ${expected.join(' · ')}\n` +
      `      actual:   ${actual.length ? actual.join(' · ') : '(none)'}`
    );
  }

  (caseObj.sections || []).forEach((section, i) => {
    const paragraphs = (section.body || []).filter((p) => typeof p === 'string' && p.trim());
    if (paragraphs.length === 0) {
      problems.push(`section ${i + 1} ("${section.heading}") has no prose`);
    }
  });

  return problems;
}

// Meta description and JSON-LD both pull from the case's own opening
// sentence, so a content edit propagates to metadata automatically
// rather than needing a second place to remember.
function metaDescriptionFor(caseObj) {
  const opening = caseObj.sections?.[0]?.body?.[0];
  if (opening) return opening;
  if (caseObj.entityLine) return caseObj.entityLine;
  return `${caseObj.title} — a case study from Ayomide Grace Amusan's portfolio.`;
}

function findAdjacent(caseObj, direction) {
  const idx = listedCases.indexOf(caseObj);
  for (let step = 1; step <= listedCases.length; step++) {
    const i = (idx + direction * step + listedCases.length * 2) % listedCases.length;
    if (listedCases[i] !== caseObj) return listedCases[i];
  }
  return null;
}

function sectionId(heading) {
  return heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function renderSections(caseObj) {
  return caseObj.sections
    .map((section) => {
      const paragraphs = section.body
        .map((p) => `        <p>${escapeHtml(p)}</p>`)
        .join('\n');
      return `      <section class="case-block" id="${sectionId(section.heading)}">
        <h2>${escapeHtml(section.heading)}</h2>
${paragraphs}
      </section>`;
    })
    .join('\n\n');
}

function pageForCase(caseObj) {
  const domain = domainLabel.get(caseObj.domain) || caseObj.domain;
  const template = TEMPLATES[caseObj.template];
  const capNames = caseObj.capabilities.map((s) => capabilityLabel.get(s) || s);
  const dateText = displayDateRange(caseObj);
  const byline = caseObj.entityLine
    ? escapeHtml(caseObj.entityLine)
    : `${escapeHtml(displayLabel(caseObj))}${dateText ? ' · ' + escapeHtml(dateText) : ''}`;

  // Template A carries a date/scale line, B a stack/team-shape line.
  // Either is omitted rather than invented where the CV doesn't say.
  const contextLine = caseObj.scaleLine || caseObj.contextLine || null;

  const prev = findAdjacent(caseObj, -1);
  const next = findAdjacent(caseObj, 1);

  const metaDescription = metaDescriptionFor(caseObj);
  const hasRealDates = Boolean(caseObj.dateStart && caseObj.dateEnd);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: caseObj.title,
    description: metaDescription,
    about: domain,
    keywords: capNames.join(', '),
    creator: { '@type': 'Person', name: 'Ayomide Grace Amusan' },
    ...(hasRealDates ? { temporalCoverage: `${caseObj.dateStart}/${caseObj.dateEnd}` } : {}),
  };

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(caseObj.title)} — Ayomide Grace Amusan</title>
<meta name="description" content="${escapeHtml(metaDescription)}">
<link rel="icon" type="image/svg+xml" href="../../assets/favicon.svg">
<!-- Preloading these is load-bearing, not an optimisation. Without them
     the metric-matched fallbacks paint first and the real faces swap in
     afterwards, re-wrapping the display title and the mono nav — measured
     as a deterministic ~0.12 CLS on every case page, while the pages that
     did preload measured 0. -->
<link rel="preload" as="font" type="font/woff2" href="../../fonts/archivo-black-expanded.woff2" crossorigin>
<link rel="preload" as="font" type="font/woff2" href="../../fonts/jetbrains-mono-regular.woff2" crossorigin>
<link rel="preload" as="font" type="font/woff2" href="../../fonts/jetbrains-mono-bold.woff2" crossorigin>
<link rel="preload" as="font" type="font/woff2" href="../../fonts/source-serif-4-regular.woff2" crossorigin>
<link rel="preload" as="font" type="font/woff2" href="../../fonts/source-serif-4-italic.woff2" crossorigin>
<link rel="stylesheet" href="../../css/tokens.css">
<link rel="stylesheet" href="../../css/home.css">
<link rel="stylesheet" href="../../css/case.css">
<meta property="og:title" content="${escapeHtml(caseObj.title)}">
<meta property="og:description" content="${escapeHtml(metaDescription)}">
<meta property="og:image" content="../../assets/og/${caseObj.slug}.png">
<meta property="og:type" content="article">
<script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
</script>
</head>
<body data-template="${caseObj.template}">

<a class="skip-link" href="#main">Skip to content</a>

<header class="site-header">
  <a class="wordmark" href="../../">Ayomide Amusan</a>
  <nav aria-label="Primary">
    <a href="../../work/">Work</a>
    <a href="../../about/">About</a>
    <a class="cv-link" href="../../assets/cv/ayomide-amusan-cv.pdf">Download CV</a>
  </nav>
</header>

<main id="main">
  <header class="case-header">
    <div class="case-header-inner">
      <p class="case-type">${escapeHtml(template.label)}</p>
      <h1>${escapeHtml(caseObj.title)}</h1>
      <p class="entity-line">${byline}</p>
${contextLine ? `      <p class="case-context">${escapeHtml(contextLine)}</p>\n` : ''}    </div>
  </header>

  <div class="case-layout">
    <aside class="case-aside">
      <nav class="case-toc" aria-label="Sections in this case">
        <p class="case-aside-label">In this case</p>
        <ol>
          ${caseObj.sections.map((sec, i) => `<li><a href="#${sectionId(sec.heading)}"><span class="toc-num">${String(i + 1).padStart(2, '0')}</span>${escapeHtml(sec.heading)}</a></li>`).join('\n          ')}
        </ol>
      </nav>
      <div class="case-aside-meta">
        <p class="case-aside-label">Field</p>
        <p class="case-aside-value">${escapeHtml(domain)}</p>
        <p class="case-aside-label">Brought to it</p>
        <ul class="case-aside-tags">
          ${capNames.map((c) => `<li>${escapeHtml(c)}</li>`).join('\n          ')}
        </ul>
      </div>
    </aside>

    <div class="case-body">
${renderSections(caseObj)}
    </div>
  </div>

  <nav class="case-nav" aria-label="Other cases">
    ${prev ? `<a class="prev-case" href="../${prev.slug}/"><span class="nav-label">Previous</span><span class="nav-title">${escapeHtml(prev.title)}</span></a>` : '<span></span>'}
    ${next ? `<a class="next-case" href="../${next.slug}/"><span class="nav-label">Next</span><span class="nav-title">${escapeHtml(next.title)}</span></a>` : ''}
  </nav>
</main>

<footer class="site-footer">
  <span>&copy; Ayomide Grace Amusan</span>
  <a href="../../contact/">Contact</a>
  <a href="../../assets/cv/ayomide-amusan-cv.pdf">Download CV</a>
</footer>

</body>
</html>
`;
}

// Per-capability domain coverage across LISTED cases only — an unlisted
// case proves nothing about breadth. Runs on every build so a coverage
// gap shows up immediately rather than when someone thinks to ask.
function printCoverageReport() {
  console.log('\nCapability coverage by domain, listed cases only (single-case dependencies flagged):');
  CAPABILITIES.forEach((cap) => {
    const withCap = listedCases.filter((c) => c.capabilities.includes(cap.slug));
    if (withCap.length === 0) {
      console.log(`\n  ${cap.label} — no listed cases`);
      return;
    }
    const byDomain = new Map();
    withCap.forEach((c) => {
      if (!byDomain.has(c.domain)) byDomain.set(c.domain, []);
      byDomain.get(c.domain).push(c.slug);
    });
    console.log(`\n  ${cap.label} — ${byDomain.size} domain(s):`);
    for (const [domainSlug, slugs] of byDomain) {
      const label = DOMAINS.find((d) => d.slug === domainSlug)?.label || domainSlug;
      console.log(`    ${label}: ${slugs.join(', ')}${slugs.length === 1 ? '  <-- single case' : ''}`);
    }
  });
  console.log('');
}

function printTemplateReport() {
  console.log('Engagement types (PRD v2 §5):');
  Object.entries(TEMPLATES).forEach(([key, template]) => {
    const inTemplate = listedCases.filter((c) => c.template === key);
    console.log(`  ${key} — ${template.label}: ${inTemplate.length ? inTemplate.map((c) => c.slug).join(', ') : '(none listed)'}`);
  });
  console.log('');
}

function run() {
  printTemplateReport();
  printCoverageReport();

  const generated = [];
  const invalid = [];

  listedCases.forEach((caseObj) => {
    const problems = validate(caseObj);
    if (problems.length > 0) {
      invalid.push({ slug: caseObj.slug, problems });
      return;
    }
    const dir = join(ROOT, 'work', caseObj.slug);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'index.html'), pageForCase(caseObj));
    generated.push(caseObj);
  });

  console.log(`Generated ${generated.length} case page(s):`);
  generated.forEach((c) => console.log(`  work/${c.slug}/ — template ${c.template}`));

  if (unlistedCases.length > 0) {
    console.log(`\nNot listed (${unlistedCases.length}) — no page, no card, no link, by design:`);
    unlistedCases.forEach((c) => console.log(`  ${c.slug} — needs written content before it can be listed`));
  }

  if (invalid.length > 0) {
    console.log(`\n${ALLOW_DRAFTS ? 'PROBLEM' : 'BLOCKING'} — ${invalid.length} listed case(s) failed validation and were NOT written:`);
    invalid.forEach(({ slug, problems }) => {
      console.log(`\n  ${slug}:`);
      problems.forEach((p) => console.log(`    - ${p}`));
    });
    if (ALLOW_DRAFTS) {
      console.log('\n--allow-drafts passed: exiting 0 so a deploy is not blocked, but these pages do not exist.\n');
    } else {
      console.log('\nFix the above, or set listed: false to take the case out of the site entirely.\n');
      process.exitCode = 1;
    }
  } else {
    console.log('\nAll listed cases valid.\n');
  }
}

run();
