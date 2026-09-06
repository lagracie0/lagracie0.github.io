// Single source of truth for /work, the case pages, and the home page's
// featured cases. PRD v2 (docs/PRD.md) replaced the v1 six-block schema
// with four adaptive templates — see TEMPLATES below.
//
// Shape notes:
// - `template` is 'A' | 'B' | 'C' | 'D' and decides which headings a case
//   uses. scripts/build-case-pages.mjs validates that a listed case's
//   section headings match its template exactly, so a case can't quietly
//   drift into a shape nothing else on the site expects.
// - `sections` is ordered: [{ heading, body: [paragraph, ...] }]. Prose,
//   first person, past tense. Every section is written or the case isn't
//   listed — there is no partial state and no placeholder rendering.
// - `listed: false` marks a case that exists but has no writable content
//   yet. It is skipped entirely: no page, no card, no link. PRD v2 §5:
//   "A case is either written or it is not listed." No draft banners, no
//   [NEEDS INPUT] markers in production.
// - `metrics` entries are { value, label, method? }. `method` is now
//   OPTIONAL (v1 made it mandatory): PRD v2 §5 says a number carries a
//   method note where the method is known, and where it isn't the number
//   appears without a spurious one. These are not rendered on case pages
//   — the numbers already appear inside the prose — they're kept for the
//   stats block contemplated in PRD §12 Q4.
// - `scaleLine` (Template A) and `contextLine` (Template B) are the
//   "date and scale" / "stack and team shape" lines those two templates
//   call for. Both omitted rather than invented where the CV doesn't say.
// - No invented facts. Every sentence traces to the CV, to Ayomide's own
//   written input, or to the confidentiality-cleared C1 content.

export const DOMAINS = [
  { slug: 'civic', label: 'Civic & elections' },
  { slug: 'infrastructure', label: 'Infrastructure & policy' },
  { slug: 'fintech', label: 'Fintech' },
  { slug: 'hospitality', label: 'Hospitality & travel' },
  { slug: 'consumer', label: 'Consumer & marketplaces' },
  { slug: 'events', label: 'Events & community' },
  { slug: 'devinfra', label: 'Developer / web infrastructure' },
  { slug: 'health-research', label: 'Health & research' },
];

// Kept as metadata. PRD v2 §7 demotes these below the title on cards
// rather than letting the taxonomy be the interface (v1's F4).
export const CAPABILITIES = [
  { slug: 'build-from-zero', label: 'Build from zero' },
  { slug: 'stakeholder', label: 'Stakeholder / vendor' },
  { slug: 'delivery', label: 'Delivery & release' },
  { slug: 'live-ops', label: 'Live ops, fixed date' },
  { slug: 'research', label: 'Research & reporting' },
  { slug: 'ships-it-herself', label: 'Ships it myself' },
];

// The four engagement types. `headings` is the exact, ordered set a case
// of that template must use — the build script enforces it. `label` is
// what a visitor sees when work is grouped by type (PRD v2 §4: grouped
// by type rather than filtered by taxonomy).
export const TEMPLATES = {
  A: {
    label: 'Live operation',
    blurb: 'Fixed date, no slip.',
    headings: ['The brief', 'What running it involved', 'The hard part', 'What held'],
  },
  B: {
    label: 'Product delivery',
    blurb: 'Scoping through release and past it.',
    headings: ['The product', 'Where I came in', 'How delivery ran', 'What shipped'],
  },
  C: {
    label: 'Built from nothing',
    blurb: 'No prior structure to inherit.',
    headings: ['What didn\'t exist', 'What I built', 'How it works now', 'Where it got to'],
  },
  D: {
    label: 'Ongoing function',
    blurb: 'A standing role, not a project.',
    headings: ['The role', 'The work', 'What changed because of it'],
  },
};

// Read LISTED_CASES, not CASES, anywhere the site renders links or cards
// — an unlisted case has no generated page, so linking to one produces a
// 404. CASES stays exported for the build scripts that need to report on
// what is unlisted and why. Defined below the array.

export const CASES = [
  {
    slug: 'situation-room-osun-election',
    title: 'Situation Room supervision — Osun governorship election',
    org: 'Accord Party',
    // The engaging entity is the Accord Party, not the Osun State
    // Government. Never name the state government as employer here or in
    // metadata.
    entityLine: 'Supervisor, Situation Room, Accord Party — Osun State governorship election, 20 July to 15 August 2026.',
    template: 'A',
    domain: 'civic',
    capabilities: ['stakeholder', 'live-ops', 'research'],
    dateStart: '2026-07-20',
    dateEnd: '2026-08-15',
    // Deliberately reduced for confidentiality and cleared at that level.
    // Do not restore detail from earlier drafts: no named individuals, no
    // escalation-path specifics, no network detail, no political framing.
    // PRD v2 §5 keeps this rule unchanged from v1.
    scaleLine: '20 July – 15 August 2026 · A cluster of LGA desks · Osun State',
    sections: [
      {
        heading: 'The brief',
        body: [
          'The Accord Party ran a Situation Room for the Osun State governorship election — a designed operation with a defined command structure, a fixed reporting chain from the field to the desk, and a severity classification applied to every issue raised. I supervised a cluster of LGA desks inside that structure, across a four-week run-up and through election day itself.',
        ],
      },
      {
        heading: 'What running it involved',
        body: [
          'Agents were assigned to specific LGAs, so reports arriving from within the same territory rarely contradicted each other. My desks took those reports and held them to one standard log format: time, location, source, verification status, action owner, current status.',
          'That format mattered more than it sounds. It meant any report could be picked up mid-shift by someone who had not taken the original call — the difference between a desk that survives a handover and one that only works while the same person is sitting at it.',
        ],
      },
      {
        heading: 'The hard part',
        body: [
          'The framework existed on paper before the field network did. Verified contacts, end-to-end collation testing and a proven fallback for technical failure were all specified, and none of them had been exercised.',
          'Two standing rules pulled against each other under time pressure: verify before escalating, and escalate serious issues immediately. The choice I made and held was to confirm through a second source first, accepting delay as the cost of not acting on an unconfirmed report. Where a contact could not be reached at all, reporting fell back to the next level up the chain — that preserved coverage but lost granularity, and it was a trade made deliberately rather than by default.',
        ],
      },
      {
        heading: 'What held',
        body: [
          'A verified contact network across the assigned LGAs, with redundancy at every level, so a single unreachable contact never blacked out a unit.',
          'Documentation oversight paired to named supervisors by area and briefed individually rather than collectively, so accountability sat with a person rather than a rota. Collation and reporting readiness were tested ahead of go-live, which is why failures surfaced on a rehearsal instead of on the one day that could not move.',
        ],
      },
    ],
    metrics: [],
  },

  {
    slug: 'africa-infrastructure-roundtable',
    title: 'Africa Infrastructure Roundtable — Manchester 2026, London 2027 pipeline',
    org: 'Langovest',
    template: 'A',
    domain: 'infrastructure',
    capabilities: ['delivery', 'stakeholder', 'live-ops'],
    dateStart: '2026-03',
    dateEnd: '2026-08',
    scaleLine: 'Manchester 2026 edition · London 2027 pipeline · UK and Nigeria stakeholders',
    // Prose below is Ayomide's own, from PRD v2 §6, where it is given as
    // the worked example of the writing standard. Kept as written.
    sections: [
      {
        heading: 'The brief',
        body: [
          'Langovest runs the Africa Infrastructure Roundtable, a convening that brings African infrastructure investors and institutions into the same room as UK universities and capital. I ran the Manchester 2026 edition end to end, and then built the pipeline for London 2027.',
        ],
      },
      {
        heading: 'What running it involved',
        body: [
          'Stakeholders sat on two continents and worked to different calendars — Nigerian partners and UK institutions, neither of whom could be kept waiting on the other. I owned the delivery schedule across both, which meant the programme, the speakers, the partner commitments and the run of the day itself all had to converge on a date that could not move.',
        ],
      },
      {
        heading: 'The hard part',
        body: [
          'Manchester was the deliverable; London was the harder problem, because it didn\'t exist yet. I scoped the 2027 edition around a five-university engagement framework — UCL, Imperial College London, Brunel, SOAS and the University of Lagos — which meant turning a list of desirable institutions into a sequenced outreach pipeline with owners and dates, before there was an event to invite them to.',
        ],
      },
      {
        heading: 'What held',
        body: [
          'Manchester ran. The London framework exists as a working pipeline rather than an ambition, and the five-university structure is what the 2027 edition is being built on.',
        ],
      },
    ],
    metrics: [],
  },

  {
    slug: 'osun-tech-festival',
    title: 'Osun Tech Festival — a full festival on a one-month lead time',
    org: 'Osun Tech Festival',
    template: 'A',
    domain: 'events',
    capabilities: ['live-ops', 'stakeholder'],
    dateStart: '2026-02-19',
    dateEnd: '2026-02-20',
    scaleLine: '19–20 February 2026 · Single-month lead time · Speakers, vendors, venue and volunteers',
    sections: [
      {
        heading: 'The brief',
        body: [
          'The Osun Tech Festival had a fixed date — 19 and 20 February 2026 — and roughly a month to reach it. I managed it to delivery on that lead time, which meant every part of it had to be owned at once rather than sequenced comfortably.',
        ],
      },
      {
        heading: 'What running it involved',
        body: [
          'Speaker coordination, vendor contracts, venue logistics and volunteer deployment all sat with me.',
          'Those are four different kinds of work. One runs on other people\'s calendars, one is commercial and needs signatures, one is physical and tied to a place, and one is staffing a workforce where most people arrive for the first time on the day itself. On a single-month timeline none of them can wait politely for the others to finish.',
        ],
      },
      {
        heading: 'The hard part',
        body: [
          'A month is not enough time for anything to go wrong twice.',
          'Speakers confirm late. Vendors want contracts signed before they will hold anything. The venue needs decisions that depend on the programme, and the programme depends on the speakers. That is a circular dependency with an immovable date at the end of it, and it only resolves by deciding what is good enough to commit to early instead of waiting for complete information.',
        ],
      },
      {
        heading: 'What held',
        body: [
          'The festival ran across both days as scheduled.',
          'The work did not stop when the doors closed. I ran the post-event programme through follow-up engagement and partner debriefs after the festival ended — the part that decides whether an event was a one-off or the first edition of something.',
        ],
      },
    ],
    metrics: [],
  },

  {
    slug: 'lodgr-booking-platform',
    title: 'Lodgr — a booking platform from scoping to post-launch review',
    org: 'Lodgr',
    template: 'B',
    domain: 'hospitality',
    capabilities: ['build-from-zero', 'delivery', 'research'],
    // The independent PM contract's bounding period. The CV doesn't split
    // which weeks belonged to Lodgr versus Boldtron, so this is the honest
    // bound rather than a precise range.
    dateStart: '2025-09',
    dateEnd: '2026-03',
    sections: [
      {
        heading: 'The product',
        body: [
          'Lodgr is an apartment and hotel booking platform. I led it end to end during my independent project management contract — from scoping, through release, to the post-launch review.',
        ],
      },
      {
        heading: 'Where I came in',
        body: [
          'At scoping, and into a client with no existing project management function. There were no project plans, no schedules, no resource allocation, no risk register and no change-request process — not because anyone had dismantled them, but because nobody had needed to build them yet.',
          'Booking, availability and payment requirements existed as intentions rather than as anything an engineering team could pick up and start on.',
        ],
      },
      {
        heading: 'How delivery ran',
        body: [
          'I turned those requirements into user stories and sprint plans the engineering team could work from, and built the delivery infrastructure around them: project plans, schedules, resource allocations, a risk register and change-request handling, plus the reporting sequence that kept the team and the stakeholders looking at the same picture.',
          'A booking platform is unforgiving about this. Availability and payment are the two places where a vague requirement turns into a customer-facing failure, so the specificity was the point rather than process for its own sake.',
        ],
      },
      {
        heading: 'What shipped',
        body: [
          'The platform reached release and then went through a post-launch review, rather than being declared finished at launch.',
          'The delivery structure outlasted the release. It was what the engagement ran on afterwards, not scaffolding taken down once the product was live.',
        ],
      },
    ],
    metrics: [],
  },

  {
    slug: 'boldtron-marketplace-app',
    title: 'Boldtron — marketplace app delivery for a fully remote team',
    org: 'Boldtron',
    template: 'B',
    domain: 'consumer',
    capabilities: ['delivery', 'stakeholder'],
    dateStart: '2025-09',
    dateEnd: '2026-03',
    contextLine: 'Fully remote team across design, development and QA.',
    sections: [
      {
        heading: 'The product',
        body: [
          'Boldtron is a marketplace app. I owned delivery for it through the release cycle, working with a team that was fully remote across design, development and QA.',
        ],
      },
      {
        heading: 'Where I came in',
        body: [
          'As the point of accountability — the single person stakeholders could hold to a date.',
          'This was one of the client relationships with no existing project management function, so the delivery infrastructure had to be built alongside the delivery itself rather than inherited from anyone.',
        ],
      },
      {
        heading: 'How delivery ran',
        body: [
          'I directed design, development and QA through the release cycle, and set the roadmap and dependency decisions — which of the three disciplines blocked which, and in what order things had to land.',
          'Remote delivery makes dependencies expensive. Nobody overhears that something has slipped, so it is either visible in the plan or it is not visible at all. Project plans, schedules, resource allocations, a risk register and change-request handling all came in as part of that, along with the reporting sequence that kept the team and stakeholders aligned.',
        ],
      },
      {
        heading: 'What shipped',
        body: [
          'The release cycle completed with one accountable owner rather than responsibility spread thinly across three disciplines and several time zones.',
        ],
      },
    ],
    metrics: [],
  },

  {
    slug: 'hostmeng-clea-pushbio',
    title: 'Clea and Pushbio — product enhancement at HostMeNG',
    org: 'HostMeNG',
    template: 'B',
    domain: 'devinfra',
    capabilities: ['delivery', 'research'],
    dateStart: '2024-07',
    dateEnd: '2025-01',
    contextLine: 'Cross-functional team across multiple countries — developers, designers and website managers.',
    sections: [
      {
        heading: 'The product',
        body: [
          'Clea and Pushbio are HostMeNG\'s flagship tools, sitting alongside its web hosting business. I was technical project manager for both between July 2024 and January 2025.',
        ],
      },
      {
        heading: 'Where I came in',
        body: [
          'Into existing products with existing users, and a cross-functional team spread across multiple countries — developers, designers, website managers and other stakeholders who needed to be working from one set of priorities rather than several.',
        ],
      },
      {
        heading: 'How delivery ran',
        body: [
          'Enhancements ran on two inputs. Iterative feedback integration, so what users were actually reporting shaped what got built next; and market trend analysis, so the roadmap was not purely reactive to the last complaint.',
          'Alongside that I worked with the developers, designers and website managers to optimise the processes the hosting service itself ran on. At that size the delivery work and the operational work are the same work.',
        ],
      },
      {
        heading: 'What shipped',
        body: [
          'User retention on Clea and Pushbio rose by 15% across the period.',
          'Retention is the honest measure for tools like these. It says people came back — not that they arrived once.',
        ],
      },
    ],
    metrics: [
      { value: '+15%', label: 'user retention on Clea and Pushbio' },
    ],
  },

  {
    slug: 'calnita-beauty-mvps',
    title: 'Calnita — three MVPs for hyper-personalised beauty discovery',
    org: 'Calnita',
    template: 'B',
    domain: 'consumer',
    capabilities: ['delivery', 'research'],
    dateStart: '2023-06',
    dateEnd: '2024-03',
    contextLine: 'Cross-functional teams across product development, marketing and engineering.',
    sections: [
      {
        heading: 'The product',
        body: [
          'Calnita was building hyper-personalised beauty discovery — features that narrow an overwhelming category down to what one specific person would actually use. I ran delivery on three MVPs for it between June 2023 and March 2024.',
        ],
      },
      {
        heading: 'Where I came in',
        body: [
          'Across product development, marketing and engineering at once.',
          'Three MVPs in ten months changes the question. It is never whether something can be built; it is which of these is worth building next, and what it costs to be wrong about that.',
        ],
      },
      {
        heading: 'How delivery ran',
        body: [
          'Prioritisation was data-backed rather than argued. What went into each MVP, and in what order, came from evidence rather than from whoever made the case most forcefully in the room.',
          'I also pioneered the user research work with the marketing and engineering teams, which surfaced unmet needs that then shaped the roadmap. The research was not a parallel track producing a document nobody read — it was the input that decided what the next MVP contained.',
        ],
      },
      {
        heading: 'What shipped',
        body: [
          'Three MVPs launched, with 90% on-time delivery across them.',
          'The roadmap they ran against had been redirected by what the research actually found, rather than by what was assumed about the category at the start.',
        ],
      },
    ],
    metrics: [
      { value: '3', label: 'MVPs launched' },
      { value: '90%', label: 'on-time delivery across them' },
    ],
  },

  {
    slug: 'langovest-website-redesign',
    title: 'Langovest website redesign — fixing the briefs, not just the board',
    org: 'Langovest',
    template: 'B',
    domain: 'devinfra',
    capabilities: ['delivery', 'research'],
    dateStart: '2026-03',
    dateEnd: '2026-08',
    sections: [
      {
        heading: 'The product',
        body: [
          'The Langovest website, rebuilt across design and engineering during my time there as project manager and coordinator.',
        ],
      },
      {
        heading: 'Where I came in',
        body: [
          'Upstream of the software team, which is where the actual problem was.',
          'Briefs were reaching engineering without the detail needed to act on them. That is the expensive kind of problem, because it does not look like a delay — it looks like a team asking reasonable questions.',
        ],
      },
      {
        heading: 'How delivery ran',
        body: [
          'I ran the delivery lifecycle in Trello and restructured the project briefs going into it, so that what reached the software team was specific enough to start on without a round trip first.',
          'That is most of what delivery management is on a redesign. The board is the visible artefact and the briefs are not, but the briefs are what decide whether the board moves.',
        ],
      },
      {
        heading: 'What shipped',
        body: [
          'The redesign was delivered across both design and engineering, with 95% of tickets held to schedule.',
        ],
      },
    ],
    metrics: [
      { value: '95%', label: 'of tickets held to schedule' },
    ],
  },

  {
    slug: 'langovest-volunteer-network',
    title: 'Langovest Volunteer Network — from zero to twelve across four countries',
    org: 'Langovest',
    template: 'C',
    domain: 'infrastructure',
    capabilities: ['build-from-zero', 'stakeholder'],
    dateStart: '2026-03',
    dateEnd: '2026-08',
    sections: [
      {
        heading: 'What didn\'t exist',
        body: [
          'Langovest had no volunteer network. Not an underperforming one — none.',
          'There was no way to receive an application, no answer to send back, no structure to place someone into once they had said yes, and no means of coordinating people who would never be in the same country as each other.',
        ],
      },
      {
        heading: 'What I built',
        body: [
          'Three systems, in the order they are actually needed.',
          'Onboarding, so that someone arriving knows what they are joining and what is expected of them. Application-response, so an application gets an answer instead of silence — the fastest way to lose a volunteer is to leave them wondering whether anyone read it. And coordination, so that people spread across the UK, Canada, Nigeria and other African countries could operate as one network rather than several disconnected pockets.',
        ],
      },
      {
        heading: 'How it works now',
        body: [
          'Volunteers come in through a defined route rather than through whoever happened to know someone, and get a response on a predictable timescale.',
          'They land in a structure whose coordination assumes distance and multiple time zones by default, instead of treating them as the exception to a co-located norm.',
        ],
      },
      {
        heading: 'Where it got to',
        body: [
          'Twelve active volunteers within four months of starting from nothing, across four countries and beyond.',
        ],
      },
    ],
    metrics: [
      { value: '0 → 12', label: 'active volunteers in 4 months, across 4+ countries' },
    ],
  },

  {
    slug: 'lendsqr-product-operations',
    title: 'Product operations at Lendsqr',
    org: 'Lendsqr',
    entityLine: 'Product Operations Officer, Lendsqr — August to September 2025.',
    template: 'D',
    domain: 'fintech',
    capabilities: ['research', 'stakeholder'],
    dateStart: '2025-08',
    dateEnd: '2025-09',
    sections: [
      {
        heading: 'The role',
        body: [
          'Product Operations Officer at Lendsqr, a fintech, across August and September 2025.',
          'Product ops sits between the people using a product and the people building it. The job is largely making sure what one group experiences reaches the other group in a form they can actually act on.',
        ],
      },
      {
        heading: 'The work',
        body: [
          'Customer enquiries came to me, and the technical ones went to the product team with enough context to be resolved rather than re-diagnosed from scratch. That collaboration was the day-to-day.',
          'Underneath it, I worked on product documentation, knowledge bases and user resources — the part that reduces how many enquiries need a person at all. And I tracked and analysed product usage trends, looking for the process gaps that show up as patterns in behaviour rather than as complaints in a queue.',
        ],
      },
      {
        heading: 'What changed because of it',
        body: [
          'The usage analysis fed enhancement recommendations into product improvement work — gaps identified from what users actually did, not only from what support tickets happened to mention.',
          'The documentation work is the half that compounds. Every question answered properly once is a question that stops arriving.',
        ],
      },
    ],
    metrics: [],
  },

  {
    slug: 'fmc-clinical-research',
    title: 'Clinical research coordination — Federal Medical Centre, Ogun State',
    org: 'Federal Medical Centre, Ogun State',
    template: 'D',
    domain: 'health-research',
    capabilities: ['stakeholder', 'research'],
    dateStart: '2022-09',
    dateEnd: '2023-06',
    sections: [
      {
        heading: 'The role',
        body: [
          'Project manager for clinical research at the Federal Medical Centre in Ogun State, from September 2022 to June 2023.',
          'This was the first project management role I held, and it came before I knew that was what it was called.',
        ],
      },
      {
        heading: 'The work',
        body: [
          'Research proposals moved through a fixed review path — from the submitting researcher, to the professor and second readers assigned to it, through to a decision to stamp or reject. Keeping that path moving was the job.',
          'I assisted in recruiting investigators onto studies and collected the documentation that compliance and execution depend on, which in a clinical setting is not administrative overhead — it is what makes the research usable afterwards. I reviewed current literature on the relevant medical topics so that project strategy was informed by what the field knew now, rather than what it knew when a study was first designed.',
          'And I tracked and coordinated data collection: accurate, timely gathering, and the follow-up visits that decide whether a data set is complete or merely large.',
        ],
      },
      {
        heading: 'What changed because of it',
        body: [
          'Studies moved through review and data collection with continuity. The follow-up work is what keeps a longitudinal data set from quietly developing holes in it.',
          'It is also where everything after this came from. The committee chairman told me the work suited me and pushed me toward project management, which led to a Coursera course, and from there into delivery.',
        ],
      },
    ],
    metrics: [],
  },

  {
    // NOT LISTED. Frobits is Ayomide's own product and appears nowhere in
    // the CV, so there is no traceable material to write it from — every
    // block would be invention. PRD v2 §5: a case is either written or it
    // is not listed. It is skipped entirely by the build (no page, no
    // card, no link) until Ayomide supplies the content herself.
    //
    // To list it: set listed: true and add `sections` matching TEMPLATES.C
    // headings — what didn't exist / what I built / how it works now /
    // where it got to. The v1 WRD named writing the PRD, building the
    // prototype and deploying the backend as the differentiators here;
    // that needs confirming rather than assuming.
    slug: 'frobits-ai-music-whatsapp',
    title: 'Frobits — AI music generation in WhatsApp',
    org: 'Frobits',
    template: 'C',
    domain: 'consumer',
    capabilities: ['ships-it-herself'],
    dateStart: '2026',
    dateEnd: '2026',
    listed: false,
    sections: [],
    metrics: [],
  },
];

// The list everything user-facing should render from. See the note above
// CASES: an unlisted case has no page, so a card or link pointing at one
// is a 404 waiting to happen.
export const LISTED_CASES = CASES.filter((c) => c.listed !== false);
