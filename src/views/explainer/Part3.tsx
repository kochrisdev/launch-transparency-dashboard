// Ported verbatim from explainer.html.
export function Part3() {
  return (
    <section className="part" id="part-3">
      <div className="part-head">
        <span className="part-num">PART 3</span>
        <h2>Reading the dashboard</h2>
      </div>
      <p className="depth">For dashboard users — donors, ministries, implementing partners, manufacturers.</p>
      <div className="tldr">
        <span className="k">In one sentence</span>
        <p>One row is one medicine's whole life story left-to-right; the red sentence under a row is the single most important thing on the page; and three trust signals — the banner, <code>TBC</code>, and the source lines — tell you exactly how much to believe every number.</p>
      </div>
      <h3>The views</h3>
      <p>The same data file powers several presentations, each for a different reading style. Two page designs are currently live in parallel for a client decision; one will be retained.</p>
      <div className="tablewrap">
        <table>
          <thead>
            <tr>
              <th>View</th>
              <th>Page</th>
              <th>What it's for</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Journey board</td>
              <td className="pathfile">index.html</td>
              <td><strong>Design Option A (default).</strong> One row per medicine, its full pathway left to right. Emphasises each product's story. Has the country map, timing chart, CSV download, glossary tooltips, print view, and the Recent updates panel.</td>
            </tr>
            <tr>
              <td>Comparison matrix</td>
              <td className="pathfile">option-b.html</td>
              <td><strong>Design Option B.</strong> Stages as rows, medicines as columns — emphasises cross-product comparison at each gate. Same data, distinct visual identity.</td>
            </tr>
            <tr>
              <td>Pipeline poster</td>
              <td className="pathfile">pipeline.html</td>
              <td>The whole portfolio laid out MMV-poster style, by development phase (Preclinical → Approved & scaling up), with a prevention lane. Complementary — not part of the A/B decision.</td>
            </tr>
            <tr>
              <td>Data story</td>
              <td className="pathfile">story.html</td>
              <td>"The Waiting Years" — a scroll-driven narrative for donors and advocacy: one medicine's decade from approval to still-pending adoption. Every number is computed live from the data, so the story updates itself.</td>
            </tr>
            <tr>
              <td>Widget</td>
              <td className="pathfile">widget.html</td>
              <td>An embeddable one-row tracker for partner sites (<code>?product=aspy</code> etc.) — an iframe snippet drops a live single-medicine tracker into any web page.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>Two parallel <strong>editions</strong> of all views also exist: a Unitaid-branded edition (brand review) and a synthetic-data edition (entirely fictional data for safe development — marked with an unmissable purple warning strip).</p>
      <h3>How to read a row</h3>
      <ul>
        <li><strong>Start with the red sentence.</strong> The one-line note under a row names the bottleneck LAUNCH is tracking for that product, with a date. It is the initiative's core editorial output — the central UI element, not a decoration.</li>
        <li><strong>The halo ring</strong> marks where the product is right now.</li>
        <li><strong>Hover any stage dot</strong> for status detail, the next expected step, and the date the information was last verified.</li>
        <li><strong>Click a row</strong> for the full profile: target use case, price, access and supply commitments, adoption requirements, country access counts, operational research, procured volumes by channel, the time-between-gates panel, and the full milestone table — the accountability ledger, where every row carries its own source.</li>
        <li><strong>Dotted-underlined terms</strong> (SRA, PQ, MFT…) show plain-language definitions on hover or keyboard focus; a Definitions panel at the bottom lists them all.</li>
        <li><strong>Returning visitors:</strong> start at <em>Recent updates</em> (bottom of page) — what changed and when. An RSS feed (<span className="pathfile">feed.xml</span>) carries every change.</li>
      </ul>
      <h3>The three trust signals</h3>
      <ol>
        <li><strong>The banner under the title.</strong> <em>Design mockup</em> = placeholder layout data. <em>Draft data</em> = compiled from public sources, pending verification. <em>No banner</em> = verified, live data. (The whole board is currently in <em>draft</em>.)</li>
        <li><strong><code>TBC</code>.</strong> The LAUNCH team does not yet have a verifiable figure. The dashboard never estimates: an honest gap is better than an invented number. Most visible on price.</li>
        <li><strong>Provenance lines under figures</strong> — the public source, whether the manufacturer confirmed release in writing, and the date last verified.</li>
      </ol>
      <p>Two rules worth knowing the reasoning behind:</p>
      <ul>
        <li><strong>The price rule.</strong> A price appears only when the figure is public or the manufacturer has confirmed in writing that it may be shared; until then it reads <code>TBC</code>. Manufacturers operate tiered, confidential pricing — publishing an unconfirmed number could damage the very relationships LAUNCH needs.</li>
        <li><strong>The map rule.</strong> The country access map shades each country by highest level achieved (registered → in national guidelines → in MFT plans). While the underlying country survey is unverified it carries an <em>ILLUSTRATIVE</em> warning and must not be cited — a colored country reads as a fact in a way a <code>TBC</code> count never does, so the map gets a stricter verified-only standard.</li>
      </ul>
      <h3>Who uses it, and how</h3>
      <div className="tablewrap">
        <table>
          <thead>
            <tr>
              <th>Audience</th>
              <th>Typical use</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Donors & funders</td>
              <td>See which products are stuck at procurement; read procured volumes by channel; export CSV for their own reporting.</td>
            </tr>
            <tr>
              <td>Ministries of health</td>
              <td>Check country access status, the adoption-requirements panel (what a country must do before use — training, guideline updates, safety monitoring), and peer-country status on the map.</td>
            </tr>
            <tr>
              <td>Implementing partners</td>
              <td>Track operational research (who is studying real-world use, where, until when) and the delivery stage.</td>
            </tr>
            <tr>
              <td>Manufacturers</td>
              <td>See their product's board position, confirm or correct the price field, and see where downstream gates stand.</td>
            </tr>
            <tr>
              <td>Anyone republishing</td>
              <td>Everything shown is public — use Download CSV and cite the dashboard and the underlying sources; or embed the per-medicine widget.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p><strong>Update cadence:</strong> milestones are reviewed monthly and updated within days of major public events; procurement and country data quarterly. The "last updated" date sits top right. Errors can be reported to the LAUNCH team (via RBM once hosted there) or as a GitHub issue; corrections are logged in Recent updates.</p>
    </section>
  );
}
