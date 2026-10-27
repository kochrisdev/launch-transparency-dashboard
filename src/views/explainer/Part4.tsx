// Ported verbatim from explainer.html.
export function Part4() {
  return (
    <section className="part" id="part-4">
      <div className="part-head">
        <span className="part-num">PART 4</span>
        <h2>Where the numbers come from</h2>
      </div>
      <p className="depth">For analysts and anyone who needs to trust (or maintain) the data.</p>
      <div className="tldr">
        <span className="k">In one sentence</span>
        <p>Robots collect evidence from public sources into a staging area, a human analyst decides what becomes dashboard data, and an automated validator — the only gate — stops the board from ever showing an unsourced price, an unexplained delay, or a silently lying traffic light.</p>
      </div>
      <h3>One file, one gate</h3>
      <p>All routine updates change exactly one file: <span className="pathfile">data/products.js</span> — a single, human-readable data file holding every product, stage status, milestone, price, and country status, plus a glossary and a changelog. Every view, edition, and export reads from it. Before any change ships, a validator script checks it against the governance rules; the validator's own stated purpose is that <em>"a traffic light must never be able to lie silently."</em></p>
      <h3>Every value carries its provenance</h3>
      <ul>
        <li><code>source</code> — a public, citable origin (WHO PQ list, EMA register, press release).</li>
        <li><code>asOf</code> — the date the value was last verified.</li>
        <li><code>confirmedInWriting</code> — the manufacturer confirmed release of this figure in writing. The register of those written confirmations deliberately lives <em>outside</em> the public repository.</li>
        <li><code>TBC</code> — honestly unknown. Never estimated.</li>
      </ul>
      <h3>The governance rules the validator enforces</h3>
      <div className="tablewrap">
        <table>
          <thead>
            <tr>
              <th>Rule</th>
              <th>Plain meaning</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Red flags need a reason</td>
              <td>A delayed stage must carry a substantive written note, <em>and</em> the product must carry a top-level bottleneck sentence. An unsupported accusation cannot get through.</td>
            </tr>
            <tr>
              <td>Prices need confirmation</td>
              <td>A displayed price requires written manufacturer confirmation <em>or</em> a public source. Otherwise it must read <code>TBC</code>.</td>
            </tr>
            <tr>
              <td>No invented counts</td>
              <td>Country counts must be real non-negative integers or <code>TBC</code> — "an invented number is worse than an admitted gap."</td>
            </tr>
            <tr>
              <td>Volumes must add up</td>
              <td>Procurement channel splits must sum to 100%; a missing volume needs a written explanation of why.</td>
            </tr>
            <tr>
              <td>Structure is fixed</td>
              <td>Exactly 8 stage entries per product, valid status values, valid dates, unique permanent product IDs, chronological journey gates, one map entry per country.</td>
            </tr>
            <tr>
              <td>Definitions are real</td>
              <td>Glossary definitions must be actual sentences; milestone completions should cite a source (warned if not).</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>Summary statistics (medicines tracked, active bottlenecks) are <em>computed from the data at render time</em> — they can never disagree with the board.</p>
      <h3>The analyst loop</h3>
      <ol>
        <li>Edit <span className="pathfile">data/products.js</span>.</li>
        <li>Run the validator — not optional.</li>
        <li>Add a changelog entry and bump the "last updated" date.</li>
        <li>Commit and push — the live site updates within about two minutes.</li>
        <li>Automation does the rest: a dated snapshot of the data file is committed to <span className="pathfile">history/</span> (the raw material for future trend charts), the RSS feed is rebuilt, and both semantic-layer exports are regenerated — the linked-data projection (<span className="pathfile">ontology/launch-data.jsonld</span>) and the temporal graph of status changes (<span className="pathfile">ontology/launch-history.jsonld</span>).</li>
      </ol>
      <p>A quarterly script also generates a <strong>"what changed" brief</strong> — stage movements versus the history snapshots, logged updates, active bottlenecks, and every remaining <code>TBC</code> gap as the verification to-do list. A GitHub issue opens automatically on the 1st of each month with the milestone-scan checklist.</p>
      <figure>
        <svg role="img" viewBox="0 0 980 520" aria-label="Data flow: public sources feed automated fetchers and one manual download into the sourcing staging area; watch reports open review issues; a human analyst makes the only writes to the data file; the validator is the only gate; from the data file flow the website, editions, history snapshots, RSS feed, semantic-layer exports, briefs, Streamlit app and Power BI kit.">
          <defs>
            <marker id="arr2" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0,0 L8,4 L0,8 z" fill="currentColor" />
            </marker>
          </defs>
          <g fontFamily="Public Sans,Arial,sans-serif">
            {/* column labels */}
            <g fontSize="11" fontWeight="700" fill="currentColor" opacity="0.65">
              <text x="90" y="24" textAnchor="middle">PUBLIC SOURCES</text>
              <text x="330" y="24" textAnchor="middle">COLLECTION (sourcing/)</text>
              <text x="570" y="24" textAnchor="middle">HUMAN + GATE</text>
              <text x="845" y="24" textAnchor="middle">WHAT PEOPLE SEE</text>
            </g>
            {/* sources */}
            <g fontSize="11" fill="currentColor">
              <rect x="20" y="40" width="140" height="44" rx="7" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <text x="90" y="58" textAnchor="middle" fontWeight="600">ClinicalTrials.gov</text>
              <text x="90" y="72" textAnchor="middle" opacity="0.65">trial registry API</text>
              <rect x="20" y="96" width="140" height="44" rx="7" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <text x="90" y="114" textAnchor="middle" fontWeight="600">WHO PQ + EMA</text>
              <text x="90" y="128" textAnchor="middle" opacity="0.65">approval lists</text>
              <rect x="20" y="152" width="140" height="44" rx="7" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <text x="90" y="170" textAnchor="middle" fontWeight="600">Global Fund API</text>
              <text x="90" y="184" textAnchor="middle" opacity="0.65">grants, disbursements</text>
              <rect x="20" y="208" width="140" height="44" rx="7" fill="none" stroke="var(--warn)" strokeWidth="1.4" />
              <text x="90" y="226" textAnchor="middle" fontWeight="600">Global Fund PQR</text>
              <text x="90" y="240" textAnchor="middle" opacity="0.65">prices & volumes</text>
            </g>
            {/* fetch arrows */}
            <g stroke="currentColor" strokeWidth="1.3" fill="none">
              <line x1="160" y1="62" x2="248" y2="90" markerEnd="url(#arr2)" />
              <line x1="160" y1="118" x2="248" y2="108" markerEnd="url(#arr2)" />
              <line x1="160" y1="174" x2="248" y2="126" markerEnd="url(#arr2)" />
            </g>
            <line x1="160" y1="230" x2="248" y2="150" stroke="var(--warn)" strokeWidth="1.3" fill="none" strokeDasharray="5 4" markerEnd="url(#arr2)" />
            <g fontSize="10" fill="currentColor" opacity="0.75">
              <text x="196" y="52">bots: weekly /</text>
              <text x="196" y="65">monthly fetch</text>
            </g>
            <text x="20" y="276" fontSize="10" fill="var(--warn)" fontWeight="600">manual download only</text>
            <text x="20" y="289" fontSize="10" fill="var(--warn)" fontWeight="600">(scripted export is WAF-blocked)</text>
            {/* sourcing box */}
            <rect x="250" y="70" width="160" height="180" rx="9" fill="var(--surface2)" stroke="currentColor" strokeWidth="1.3" />
            <g fontSize="11" fill="currentColor">
              <text x="330" y="92" textAnchor="middle" fontWeight="700">sourcing/</text>
              <text x="330" y="116" textAnchor="middle">raw/ — dated snapshots,</text>
              <text x="330" y="130" textAnchor="middle">append-only</text>
              <text x="330" y="152" textAnchor="middle">staging/ — normalized</text>
              <text x="330" y="166" textAnchor="middle">CSVs, regenerated</text>
              <text x="330" y="188" textAnchor="middle">reports/ — what-changed</text>
              <text x="330" y="202" textAnchor="middle">watch reports</text>
              <text x="330" y="228" textAnchor="middle" fontWeight="600" opacity="0.8">never feeds the</text>
              <text x="330" y="242" textAnchor="middle" fontWeight="600" opacity="0.8">dashboards directly</text>
            </g>
            {/* watch issue */}
            <rect x="250" y="290" width="160" height="46" rx="7" fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="5 4" />
            <g fontSize="11" fill="currentColor">
              <text x="330" y="308" textAnchor="middle" fontWeight="600">"Trial watch" /</text>
              <text x="330" y="322" textAnchor="middle" fontWeight="600">"Regulatory watch" issues</text>
            </g>
            <line x1="330" y1="250" x2="330" y2="288" stroke="currentColor" strokeWidth="1.3" markerEnd="url(#arr2)" />
            <text x="338" y="272" fontSize="10" fill="currentColor" opacity="0.75">on changes</text>
            {/* analyst */}
            <rect x="490" y="110" width="160" height="66" rx="9" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1.6" />
            <g fontSize="11" fill="currentColor">
              <text x="570" y="134" textAnchor="middle" fontWeight="700">LAUNCH analyst</text>
              <text x="570" y="150" textAnchor="middle">verifies vs cited source,</text>
              <text x="570" y="164" textAnchor="middle">decides what enters</text>
            </g>
            <line x1="410" y1="143" x2="488" y2="143" stroke="currentColor" strokeWidth="1.3" markerEnd="url(#arr2)" />
            <text x="418" y="135" fontSize="10" fill="currentColor" opacity="0.75">evidence</text>
            <line x1="410" y1="310" x2="570" y2="310" stroke="currentColor" strokeWidth="1.3" fill="none" />
            <line x1="570" y1="310" x2="570" y2="180" stroke="currentColor" strokeWidth="1.3" markerEnd="url(#arr2)" />
            {/* data file */}
            <rect x="490" y="230" width="160" height="60" rx="9" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <g fontSize="11" fill="currentColor">
              <text x="570" y="254" textAnchor="middle" fontWeight="700" fontFamily="IBM Plex Mono,monospace">data/products.js</text>
              <text x="570" y="272" textAnchor="middle" opacity="0.7">the single data contract</text>
            </g>
            <line x1="570" y1="176" x2="570" y2="228" stroke="var(--accent)" strokeWidth="1.6" markerEnd="url(#arr2)" />
            <text x="580" y="200" fontSize="10" fill="var(--accent-ink)" fontWeight="700">the only writes</text>
            <text x="580" y="213" fontSize="10" fill="var(--accent-ink)" fontWeight="700">are human</text>
            {/* validator */}
            <rect x="490" y="330" width="160" height="50" rx="9" fill="var(--crit-soft)" stroke="var(--crit)" strokeWidth="1.5" />
            <g fontSize="11" fill="currentColor">
              <text x="570" y="350" textAnchor="middle" fontWeight="700">validate-data.js</text>
              <text x="570" y="366" textAnchor="middle" opacity="0.8">the only gate · CI on every push</text>
            </g>
            <line x1="570" y1="290" x2="570" y2="328" stroke="var(--crit)" strokeWidth="1.4" markerEnd="url(#arr2)" />
            <text x="580" y="313" fontSize="10" fill="var(--crit)" fontWeight="600">must pass</text>
            {/* outputs */}
            <g fontSize="11" fill="currentColor">
              <rect x="750" y="52" width="200" height="58" rx="8" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1.4" />
              <text x="850" y="74" textAnchor="middle" fontWeight="700">GitHub Pages site</text>
              <text x="850" y="90" textAnchor="middle">board · matrix · poster · story ·</text>
              <text x="850" y="103" textAnchor="middle">widget + 3 generated editions</text>
              <rect x="750" y="126" width="200" height="46" rx="8" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <text x="850" y="145" textAnchor="middle" fontWeight="600">history/ snapshots + feed.xml</text>
              <text x="850" y="160" textAnchor="middle" opacity="0.7">bot-committed on data change</text>
              <rect x="750" y="188" width="200" height="46" rx="8" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <text x="850" y="207" textAnchor="middle" fontWeight="600">Quarterly briefs</text>
              <text x="850" y="222" textAnchor="middle" opacity="0.7">what changed, TBC to-do list</text>
              <rect x="750" y="250" width="200" height="46" rx="8" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <text x="850" y="269" textAnchor="middle" fontWeight="600">Streamlit app</text>
              <text x="850" y="284" textAnchor="middle" opacity="0.7">analyst workbench, pre-flight</text>
              <rect x="750" y="312" width="200" height="46" rx="8" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <text x="850" y="331" textAnchor="middle" fontWeight="600">Power BI kit</text>
              <text x="850" y="346" textAnchor="middle" opacity="0.7">refreshes from the live site</text>
              <rect x="750" y="374" width="200" height="46" rx="8" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <text x="850" y="393" textAnchor="middle" fontWeight="600">Semantic-layer exports</text>
              <text x="850" y="408" textAnchor="middle" opacity="0.7">ontology/ · data + temporal graphs</text>
            </g>
            <g stroke="currentColor" strokeWidth="1.3" fill="none">
              <line x1="650" y1="245" x2="748" y2="90" markerEnd="url(#arr2)" />
              <line x1="650" y1="255" x2="748" y2="149" markerEnd="url(#arr2)" />
              <line x1="650" y1="265" x2="748" y2="211" markerEnd="url(#arr2)" />
              <line x1="650" y1="275" x2="748" y2="273" markerEnd="url(#arr2)" />
              <line x1="650" y1="285" x2="748" y2="330" markerEnd="url(#arr2)" />
              <line x1="650" y1="295" x2="748" y2="392" markerEnd="url(#arr2)" />
            </g>
            <text x="662" y="238" fontSize="10" fill="currentColor" opacity="0.75">push → live in ~2 min</text>
            {/* footnote inside diagram */}
            <text x="20" y="420" fontSize="11" fill="currentColor" opacity="0.75">Bots collect and propose, an analyst decides, and the validator checks. Everything downstream just displays.</text>
            <g fontSize="10.5" fill="currentColor" opacity="0.75">
              <text x="20" y="450">Cadence: trials — weekly (Mon) · Global Fund + WHO PQ/EMA — monthly (3rd) · PQR crosstab — quarterly, manual ·</text>
              <text x="20" y="466">monthly reminder issue for everything a bot can't watch reliably</text>
            </g>
          </g>
        </svg>
        <figcaption><strong>How evidence becomes a dashboard value.</strong> The collection layer is append-only and fully automated where a stable public API exists; where it doesn't (the Global Fund PQR price database actively blocks scripted export), a two-minute manual download is a deliberate design decision. Nothing collected ever flows to the dashboards automatically — an analyst's sourced edit, checked by the validator, is the only path in.</figcaption>
      </figure>
      <h3>The sourcing layer in more detail</h3>
      <div className="tablewrap">
        <table>
          <thead>
            <tr>
              <th>Collector</th>
              <th>Source & cadence</th>
              <th>Feeds</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="pathfile">fetch-trials.js</td>
              <td>ClinicalTrials.gov API v2 — weekly, automated. Diffs status, phase, completion-date and results changes; slipped dates are early bottleneck warnings.</td>
              <td>Stage 0 evidence, operational research, milestones</td>
            </tr>
            <tr>
              <td className="pathfile">fetch-regulatory.js</td>
              <td>WHO prequalification lists (medicines + vector control) and EMA EU-M4all opinions — monthly, automated. Watches for new listings, delistings, opinion changes.</td>
              <td>Stages 1, 3, 4</td>
            </tr>
            <tr>
              <td className="pathfile">fetch-globalfund.js</td>
              <td>Global Fund Data Service API (grants + disbursements) — monthly, automated.</td>
              <td>Funding-flow context for stage 6</td>
            </tr>
            <tr>
              <td className="pathfile">normalize-pqr.js</td>
              <td>Global Fund PQR price/volume crosstab — quarterly, <strong>manual download</strong> (scripted export is confirmed blocked by the site's firewall), then normalized by script.</td>
              <td>Prices and procured volumes (stage 6)</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>Three rules keep this layer honest: raw snapshots are dated and append-only (so the past can be replayed and diffed); staging files are regenerated by script and never hand-edited; and every staging row carries its source URL and retrieval date, so provenance survives the trip into the dashboard.</p>
      <h3>Source hierarchy and the confirmation register</h3>
      <p>When sources disagree, analysts prefer, in order: WHO lists and guidelines → stringent regulators (EMA, FDA) → procurement databases (Global Fund PQR, PMI reports) → national regulators and ministries → manufacturer announcements (fine for milestones, never sufficient alone for prices) → LAUNCH's own surveys, labelled as draft until verified.</p>
      <p>Written manufacturer confirmations (who confirmed what, when, under what conditions) are kept in a register <strong>outside the public repository</strong> — by policy, since they are relationship-sensitive. The public data file only ever carries the boolean flag.</p>
    </section>
  );
}
