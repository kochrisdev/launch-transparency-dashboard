// Ported verbatim from explainer.html.
export function Part1() {
  return (
    <section className="part" id="part-1">
      <div className="part-head">
        <span className="part-num">PART 1</span>
        <h2>Why this exists</h2>
      </div>
      <p className="depth">For everyone — no prior knowledge needed.</p>
      <div className="tldr">
        <span className="k">In one sentence</span>
        <p>New malaria medicines take 10–15 years to travel from "approved" to actually reaching patients, largely because no one can see where each medicine is stuck — so LAUNCH built a public dashboard that shows every medicine, every gate it must pass, and every bottleneck, with a dated reason on each delay.</p>
      </div>
      <h3>The problem: approval does not mean access</h3>
      <p>Malaria still kills on the order of half a million people a year, and progress has stalled since 2015. New medicines exist, or are close — yet historically it has taken <strong>10 to 15 years or more</strong> for a malaria product to move from regulatory approval to routine use in the countries that need it. One worked example from this project's own documentation: pyrethroid-PBO bednets took <strong>eight years</strong> just to move from an interim to a full WHO recommendation — eight years spent inside a single gate, after the science was settled.</p>
      <p>Timing now matters more than ever. <strong>Artemisinin partial resistance</strong> — malaria parasites responding more slowly to the core drug class behind nearly all modern treatment — has emerged in Southeast Asia and is confirmed in parts of East Africa. Medicines that work against resistant parasites are in the pipeline, but a decade-long lag in adoption could arrive too late.</p>
      <h3>Where it breaks down: coordination</h3>
      <p>Much of the delay comes down to visibility rather than science. A medicine's journey to patients runs through many independent institutions — the WHO, regulators, funders, manufacturers, and health ministries — each waiting on signals from the others. Nobody can see the whole board, so delays are discovered years after they begin.</p>
      <p><strong>LAUNCH</strong> (the Launch Transparency Initiative for new malaria tools, funded by Unitaid) is a bet that making the whole board visible changes behavior: if every actor can see every product, every gate, and every bottleneck — with a dated, written reason on each delay — partners can act on delays instead of discovering them later. The dashboard is that board. It will be hosted by the <strong>RBM Partnership to End Malaria</strong>, the global coordination platform for malaria, with technical oversight from the LAUNCH AMDR Core Advisory Group.</p>
      <h3>Three ideas to keep in mind</h3>
      <ol>
        <li><strong>"Approved" is not one fact — it is at least three.</strong> The WHO <em>recommends</em> a medicine, the WHO separately <em>prequalifies</em> its quality, and each country <em>registers</em> it — three independent decisions by three different bodies on three different calendars. Then a ministry must write it into national guidelines, a funder must buy it, and a supply chain must deliver it. Any of these gates can stall for years while all the others show green.</li>
        <li><strong>The dashboard's readers are the institutions it measures.</strong> WHO committees, funders, and manufacturers all see their own gates on the board. Every design and governance decision follows from that: a red light is an accusation in this domain, so the system refuses to show one without written evidence behind it.</li>
        <li><strong>Credibility depends on not guessing.</strong> Where a figure is unverified, the dashboard shows <code>TBC</code> ("to be confirmed") rather than an estimate. Every displayed number carries its public source and the date it was last verified. One invented number, discovered by the institutions being measured, would end the dashboard's credibility; an honest gap does not.</li>
      </ol>
      <div className="keyfacts">
        <div className="fact">
          <div className="n">8</div>
          <div className="l">gates each medicine must pass, from lab to patient</div>
        </div>
        <div className="fact">
          <div className="n">5</div>
          <div className="l">products tracked — two pre-launch, two launched-but-underused, one future prevention tool</div>
        </div>
        <div className="fact">
          <div className="n">10–15 yrs</div>
          <div className="l">historical lag from approval to routine use — the gap LAUNCH exists to shrink</div>
        </div>
      </div>
    </section>
  );
}
