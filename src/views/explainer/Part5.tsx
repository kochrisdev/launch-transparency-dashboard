// Ported verbatim from explainer.html.
export function Part5() {
  return (
    <section className="part" id="part-5">
      <div className="part-head">
        <span className="part-num">PART 5</span>
        <h2>How it is built</h2>
      </div>
      <p className="depth">For developers and technical reviewers.</p>
      <div className="tldr">
        <span className="k">In one sentence</span>
        <p>A static site with no build step and no backend, on purpose — plain HTML pages rendering one strict-JSON data file with vanilla JavaScript, deployed by GitHub Pages on every push, with all automation (validation, snapshots, feeds, scheduled fetches) living in four GitHub Actions workflows.</p>
      </div>
      <h3>Why so deliberately simple</h3>
      <p>The dataset is tiny (a few products × ~10 metrics), the maintainers are analysts rather than developers, and the 18-month initiative will be handed over to another organisation — so there must be nothing to install, upgrade, or break. There is no framework, no bundler, no package.json at the repo root. The repository root <em>is</em> the website.</p>
      <p>The single data contract is a JavaScript file that assigns strict JSON to <code>window.LAUNCH_DATA</code>. Using a script assignment instead of fetching a <code>.json</code> file is deliberate: it works when an analyst double-clicks <span className="pathfile">index.html</span> from their file system — no server, no CORS. The body must stay strict JSON because the validator (and every other consumer, from the RSS builder to Power BI's query) extracts and parses it with the same idiom.</p>
      <h3>How a page renders</h3>
      <p>Each page is self-contained: design tokens and components in a <code>&lt;style&gt;</code> block, an HTML skeleton, and one render script that reads the data object and builds the DOM — deriving the summary stats from the data (so they can never disagree with the board), drawing the stage tracks, wiring tooltips and keyboard access, painting the country map from generated Natural Earth geometry, and positioning the timing chart with plain percent-positioned elements (no chart library). Every interpolated data value passes through an escaping function; status is always shape + color, never color alone; both light and dark themes are handled at the token level.</p>
      <h3>Generated editions — regenerate, don't hand-edit</h3>
      <p>Three builder scripts each read the original pages and write a themed or re-datasourced copy into a committed folder: <span className="pathfile">unitaid/</span> (brand-token override appended as the last stylesheet, so the skin can't drift from the source), <span className="pathfile">synthetic/</span> (points at the fictional dataset, adds an unmissable purple warning strip), and <span className="pathfile">v2/</span> (points at the proposal dataset, adds a preview strip; the whole edition is deleted once the data is signed off and merged). The iron rule for all committed build output — editions, map geometry, history snapshots, feeds, briefs, CSV exports: <strong>rerun the builder, never edit the output.</strong></p>
      <h3>The four CI workflows</h3>
      <div className="tablewrap">
        <table>
          <thead>
            <tr>
              <th>Workflow</th>
              <th>Trigger</th>
              <th>What it does</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Validate</td>
              <td>Every push and pull request</td>
              <td>Runs the validator against both datasets (real and synthetic), re-proves the SHACL governance shapes against fresh linked-data projections, and builds the single-file preview as a smoke test. The quality gate.</td>
            </tr>
            <tr>
              <td>Snapshot & feed</td>
              <td>Push to main touching <span className="pathfile">data/products.js</span> only</td>
              <td>Validates, copies the data file to a dated <span className="pathfile">history/</span> snapshot (append-only — refuses to overwrite a same-day snapshot with different content), rebuilds <span className="pathfile">feed.xml</span> and both semantic-layer exports (<span className="pathfile">launch-data.jsonld</span>, <span className="pathfile">launch-history.jsonld</span>), and bot-commits. Its own commit can't retrigger it.</td>
            </tr>
            <tr>
              <td>Monthly reminder</td>
              <td>1st of each month</td>
              <td>Opens a GitHub issue with the milestone-scan checklist. Kept as a reminder rather than a scraper — most watched sources are CMS pages that change cosmetically, and hash-watching them would cry wolf; only stable-API sources are automated.</td>
            </tr>
            <tr>
              <td>Scheduled source fetch</td>
              <td>Mondays (trials); 3rd of month (Global Fund + regulatory); on demand</td>
              <td>Runs the fetchers, commits only under <span className="pathfile">sourcing/</span> (which the snapshot workflow ignores, so a fetch can never trigger a dashboard change), and opens a watch issue when a report contains changes.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>GitHub Pages deploys the repo root on every push to main — live in one to two minutes. CI validates on the same push but does <em>not</em> gate the deploy: a red validation run is a fix-now / revert-now signal.</p>
      <h3>The parallel platforms</h3>
      <ul>
        <li><strong>Streamlit app</strong> (<span className="pathfile">streamlit-app/</span>) — a Python twin of all views, used as the analyst workbench: it accepts the bundled file, a URL, or a dragged-in draft data file, and shows live governance-check results — so an analyst can preview and validate a data update <em>before</em> committing it. Also offers runtime configuration the static site can't: product filters, adjustable timing thresholds, and a "hide unverified map" toggle.</li>
        <li><strong>Power BI kit</strong> (<span className="pathfile">powerbi/</span>) — not a binary report but a kit: Power Query scripts that load eight relational tables live from the published site (so reports refresh with the data), offline CSV exports of the same shape, a theme, DAX measures (including ones that carry the governance rules — the data-status banner and the unverified-map warning travel into Power BI too), and a page-by-page build guide.</li>
        <li><strong>Semantic layer</strong> (<span className="pathfile">ontology/</span>) — the project's data model expressed as a formal ontology (OWL/SKOS), and the dataset published as linked data (JSON-LD) aligned to schema.org, WHO ATC drug codes, ISO country codes and Wikidata (products, countries, and the organizations behind each product and each pathway gate) — so partners can consume the portfolio as a standard knowledge graph instead of reverse-engineering the JSON. The governance signals (data status, unverified-map warning, price confirmation, <code>TBC</code>) travel into the graph as first-class properties, the governance rules themselves ship as SHACL shapes any RDF consumer can verify independently (CI re-proves them on every push), and a temporal graph records when each traffic light changed. The whole vocabulary is browsable at <span className="pathfile">/ontology/</span>; CI regenerates the exports on every data change.</li>
      </ul>
      <h3>Handover</h3>
      <p>Three options for RBM, all cheap because the site is static files: copy the file set to any path on their own site; keep the Pages deployment (or a fork under an RBM GitHub org) and embed it in an iframe; or transfer the repository — history and CI move with it, only the URL changes (two hardcoded URL constants and partner embed snippets need updating).</p>
    </section>
  );
}
