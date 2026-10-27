// Ported verbatim from explainer.html.
export function Part2() {
  return (
    <section className="part" id="part-2">
      <div className="part-head">
        <span className="part-num">PART 2</span>
        <h2>The medicine's journey</h2>
      </div>
      <p className="depth">For everyone — the domain the dashboard describes.</p>
      <div className="tldr">
        <span className="k">In one sentence</span>
        <p>Every medicine on the board travels the same eight-stage pathway — one science stage, four separate approvals run by four different bodies, and a three-stage delivery chain — and the dashboard tracks which gate each medicine is at and where it is stuck.</p>
      </div>
      <figure>
        <svg role="img" viewBox="0 0 980 330" aria-label="The eight-stage access pathway: stage 0 is science, stages 1 to 4 are four separate approvals by different institutions, stages 5 to 7 are the delivery chain. Pipeline products GanLum and ALAQ are working through the left half; underutilized products ASPY and DHA-PPQ are stuck in the right half.">
          <defs>
            <marker id="arr" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0,0 L8,4 L0,8 z" fill="currentColor" />
            </marker>
          </defs>
          {/* group brackets */}
          <g stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.75">
            <path d="M20,52 L20,40 L130,40 L130,52" />
            <path d="M145,52 L145,40 L610,40 L610,52" />
            <path d="M625,52 L625,40 L960,40 L960,52" />
          </g>
          <g fontFamily="Public Sans,Arial,sans-serif" fontSize="12" fontWeight="700" fill="currentColor">
            <text x="75" y="30" textAnchor="middle">SCIENCE</text>
            <text x="377" y="30" textAnchor="middle">FOUR SEPARATE APPROVALS — FOUR DIFFERENT BODIES</text>
            <text x="792" y="30" textAnchor="middle">DELIVERY CHAIN</text>
          </g>
          {/* connecting arrows */}
          <g stroke="currentColor" strokeWidth="1.4" fill="none">
            <line x1="130" y1="105" x2="143" y2="105" markerEnd="url(#arr)" />
            <line x1="252" y1="105" x2="265" y2="105" markerEnd="url(#arr)" />
            <line x1="374" y1="105" x2="387" y2="105" markerEnd="url(#arr)" />
            <line x1="496" y1="105" x2="509" y2="105" markerEnd="url(#arr)" />
            <line x1="610" y1="105" x2="623" y2="105" markerEnd="url(#arr)" />
            <line x1="732" y1="105" x2="745" y2="105" markerEnd="url(#arr)" />
            <line x1="846" y1="105" x2="859" y2="105" markerEnd="url(#arr)" />
          </g>
          {/* stage boxes: x widths 110, gap 12 */}
          <g fontFamily="Public Sans,Arial,sans-serif">
            {/* stage 0 */}
            <g>
              <rect x="20" y="70" width="110" height="70" rx="8" fill="none" stroke="currentColor" strokeWidth="1.4" />
              <text x="75" y="90" textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor">0 · R&D &</text>
              <text x="75" y="104" textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor">clinical</text>
              <text x="75" y="126" textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.65">lab + trials</text>
              <text x="75" y="160" textAnchor="middle" fontSize="10.5" fill="currentColor" opacity="0.8">Manufacturer</text>
              <text x="75" y="173" textAnchor="middle" fontSize="10.5" fill="currentColor" opacity="0.8">+ PDPs (MMV…)</text>
            </g>
            {/* stage 1 */}
            <g>
              <rect x="142" y="70" width="110" height="70" rx="8" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1.6" />
              <text x="197" y="90" textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor">1 · Regulatory</text>
              <text x="197" y="104" textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor">approval (SRA)</text>
              <text x="197" y="126" textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.65">anchors the rest</text>
              <text x="197" y="160" textAnchor="middle" fontSize="10.5" fill="currentColor" opacity="0.8">EMA (EU-M4all)</text>
              <text x="197" y="173" textAnchor="middle" fontSize="10.5" fill="currentColor" opacity="0.8">or US FDA</text>
            </g>
            {/* stage 2 */}
            <g>
              <rect x="264" y="70" width="110" height="70" rx="8" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1.6" />
              <text x="319" y="90" textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor">2 · WHO</text>
              <text x="319" y="104" textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor">guidelines</text>
              <text x="319" y="126" textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.65">"we recommend it"</text>
              <text x="319" y="160" textAnchor="middle" fontSize="10.5" fill="currentColor" opacity="0.8">WHO Guidelines</text>
              <text x="319" y="173" textAnchor="middle" fontSize="10.5" fill="currentColor" opacity="0.8">Development Group</text>
            </g>
            {/* stage 3 */}
            <g>
              <rect x="386" y="70" width="110" height="70" rx="8" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1.6" />
              <text x="441" y="90" textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor">3 · WHO</text>
              <text x="441" y="104" textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor">prequalification</text>
              <text x="441" y="126" textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.65">"quality is assured"</text>
              <text x="441" y="160" textAnchor="middle" fontSize="10.5" fill="currentColor" opacity="0.8">WHO PQ team —</text>
              <text x="441" y="173" textAnchor="middle" fontSize="10.5" fill="currentColor" opacity="0.8">unlocks donor buying</text>
            </g>
            {/* stage 4 */}
            <g>
              <rect x="508" y="70" width="110" height="70" rx="8" fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth="1.6" />
              <text x="563" y="90" textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor">4 · Country</text>
              <text x="563" y="104" textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor">registration</text>
              <text x="563" y="126" textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.65">country by country</text>
              <text x="563" y="160" textAnchor="middle" fontSize="10.5" fill="currentColor" opacity="0.8">National regulators</text>
              <text x="563" y="173" textAnchor="middle" fontSize="10.5" fill="currentColor" opacity="0.8">(AMA / CRP help)</text>
            </g>
            {/* stage 5 */}
            <g>
              <rect x="622" y="70" width="110" height="70" rx="8" fill="none" stroke="currentColor" strokeWidth="1.4" />
              <text x="677" y="90" textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor">5 · National</text>
              <text x="677" y="104" textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor">policy adoption</text>
              <text x="677" y="126" textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.65">into treatment rules</text>
              <text x="677" y="160" textAnchor="middle" fontSize="10.5" fill="currentColor" opacity="0.8">Ministries of health</text>
              <text x="677" y="173" textAnchor="middle" fontSize="10.5" fill="currentColor" opacity="0.8">/ NMCPs</text>
            </g>
            {/* stage 6 */}
            <g>
              <rect x="744" y="70" width="100" height="70" rx="8" fill="none" stroke="currentColor" strokeWidth="1.4" />
              <text x="794" y="90" textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor">6 ·</text>
              <text x="794" y="104" textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor">Procurement</text>
              <text x="794" y="126" textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.65">someone buys it</text>
              <text x="794" y="160" textAnchor="middle" fontSize="10.5" fill="currentColor" opacity="0.8">Global Fund, PMI,</text>
              <text x="794" y="173" textAnchor="middle" fontSize="10.5" fill="currentColor" opacity="0.8">governments</text>
            </g>
            {/* stage 7 */}
            <g>
              <rect x="858" y="70" width="102" height="70" rx="8" fill="none" stroke="currentColor" strokeWidth="1.4" />
              <text x="909" y="90" textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor">7 · In-country</text>
              <text x="909" y="104" textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor">delivery</text>
              <text x="909" y="126" textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.65">the last mile</text>
              <text x="909" y="160" textAnchor="middle" fontSize="10.5" fill="currentColor" opacity="0.8">Governments +</text>
              <text x="909" y="173" textAnchor="middle" fontSize="10.5" fill="currentColor" opacity="0.8">implementing partners</text>
            </g>
          </g>
          {/* product stall markers */}
          <g fontFamily="Public Sans,Arial,sans-serif" fontSize="11.5">
            <path d="M20,215 L20,227 L618,227 L618,215" fill="none" stroke="var(--crit)" strokeWidth="1.4" />
            <circle cx="310" cy="246" r="4" fill="var(--crit)" />
            <text x="322" y="250" fill="currentColor" fontWeight="600">Pipeline pair — GanLum & ALAQ are working through this half</text>
            <path d="M622,265 L622,277 L960,277 L960,265" fill="none" stroke="var(--crit)" strokeWidth="1.4" />
            <circle cx="640" cy="296" r="4" fill="var(--crit)" />
            <text x="652" y="300" fill="currentColor" fontWeight="600">Underutilized pair — ASPY (stage 5) &</text>
            <text x="652" y="315" fill="currentColor" fontWeight="600">DHA-PPQ (stage 6) are stuck here, a decade after approval</text>
          </g>
        </svg>
        <figcaption><strong>The access pathway.</strong> The highlighted middle gates (1–4) are four <em>independent</em> approvals by four different institutions — the single most misunderstood fact in this domain. A product can pass all of them and still reach no one if a ministry never adopts it (stage 5) or no funder buys it (stage 6).</figcaption>
      </figure>
      <h3>The eight stages, in plain words</h3>
      <div className="tablewrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Stage</th>
              <th>What it means</th>
              <th>Who runs it</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="tnum">0</td>
              <td>R&D & clinical</td>
              <td>Laboratory development and human trials (Phase I safety → Phase II dosing → Phase III large multi-country efficacy trials, typically 3–6 years).</td>
              <td>Manufacturer + product development partnerships</td>
            </tr>
            <tr>
              <td className="tnum">1</td>
              <td>Regulatory approval (SRA)</td>
              <td>Review by a stringent regulator such as the EMA or US FDA. Malaria products usually use the EMA's <strong>EU-M4all</strong> procedure (formerly "Article 58") — a full EMA scientific review for medicines used outside the EU. This opinion anchors everything downstream.</td>
              <td>EMA / FDA</td>
            </tr>
            <tr>
              <td className="tnum">2</td>
              <td>WHO guidelines</td>
              <td>WHO's expert group (the Guidelines Development Group) weighs the clinical evidence and decides whether WHO <em>recommends</em> the medicine. Countries largely copy these recommendations.</td>
              <td>WHO Global Malaria Programme</td>
            </tr>
            <tr>
              <td className="tnum">3</td>
              <td>WHO prequalification</td>
              <td>WHO's <em>quality</em> check — dossier review plus factory inspections — that makes a product eligible for purchase by UN agencies and major donors. This is the ticket that lets the Global Fund buy it.</td>
              <td>WHO Prequalification Team</td>
            </tr>
            <tr>
              <td className="tnum">4</td>
              <td>Country registration</td>
              <td>Each country's own regulator licenses the product nationally — often sequentially, country by country. The African Medicines Agency and WHO's collaborative registration procedure exist to speed this up.</td>
              <td>National regulatory authorities</td>
            </tr>
            <tr>
              <td className="tnum">5</td>
              <td>National policy adoption</td>
              <td>The ministry of health writes the medicine into <em>national treatment guidelines</em> — the document that determines what health workers actually prescribe and what the public sector buys. A WHO recommendation does <strong>not</strong> flow into these automatically.</td>
              <td>Ministries of health / NMCPs</td>
            </tr>
            <tr>
              <td className="tnum">6</td>
              <td>Procurement</td>
              <td>Someone actually pays: Global Fund grants (the majority of treatment volume), the US President's Malaria Initiative, UNICEF, domestic budgets. Tenders, reference pricing, demand forecasting.</td>
              <td>Global Fund, PMI, governments</td>
            </tr>
            <tr>
              <td className="tnum">7</td>
              <td>In-country delivery</td>
              <td>The last mile: supply chain from ports to clinics, health-worker training, job aids, and safety monitoring (pharmacovigilance).</td>
              <td>Governments + implementing partners</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h3>The traffic lights</h3>
      <p>Each medicine gets one light per stage — always paired with a symbol so the board works for colorblind readers and in print:</p>
      <div className="tablewrap">
        <table>
          <thead>
            <tr>
              <th>Light</th>
              <th>Meaning</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <span className="chip good"><span className="dot" />✓ Complete</span>
              </td>
              <td>This gate has been passed (with a cited source).</td>
            </tr>
            <tr>
              <td>
                <span className="chip warn"><span className="dot" />› In progress</span>
              </td>
              <td>Actively moving at a normal pace.</td>
            </tr>
            <tr>
              <td>
                <span className="chip crit"><span className="dot" />! Delayed</span>
              </td>
              <td>Stuck or slipped — a one-sentence, dated reason under the row says why. A red light can <em>never</em> appear without a written reason; the data validator enforces that.</td>
            </tr>
            <tr>
              <td>
                <span className="chip idle"><span className="dot" />Not started</span>
              </td>
              <td>Not yet reached (dashed outline).</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>A halo ring marks the medicine's <strong>current position</strong> — the gate it is actively working through. Elapsed time between gates is colored on one scale everywhere: <strong>green ≤ 2 years, amber 3–5, red over 5</strong>.</p>
      <h3>The medicines tracked</h3>
      <p>LAUNCH deliberately picked <strong>two pairs that stress opposite halves of the pathway</strong>. The pipeline pair tests whether transparency speeds the regulatory half; the underutilized pair — fully approved for a decade yet barely used — shows what the adoption half costs when nobody is watching. On the board, the pipeline products light up red on the left half, the marketed products on the right half.</p>
      <div className="cards">
        <div className="card">
          <span className="tag pipe">Pipeline · new chemical class</span>
          <h4>GanLum</h4>
          <div className="inn">ganaplacide–lumefantrine (KLU156) · Novartis + MMV</div>
          <p>The first non-artemisinin novel-class combination in ~25 years — strategically huge because it works against artemisinin-resistant parasites. Its Phase III trial (KALUMA) met its endpoint in Nov 2025 with a 97.4% cure rate. <strong>The watch:</strong> how fast SRA → guidelines → prequalification goes.</p>
        </div>
        <div className="card">
          <span className="tag pipe">Pipeline · triple ACT</span>
          <h4>ALAQ</h4>
          <div className="inn">artemether–lumefantrine–amodiaquine · Fosun Pharma + MORU</div>
          <p>A triple ACT: a second partner drug added to today's standard treatment to protect it from resistance. Developed under the MORU-led DeTACT partnership, targeting approval and prequalification around 2027.</p>
        </div>
        <div className="card">
          <span className="tag market">Marketed · underutilized</span>
          <h4>ASPY (Pyramax)</h4>
          <div className="inn">pyronaridine–artesunate · Shin Poong + MMV</div>
          <p>EMA opinion 2012, prequalified, WHO-recommended 2022, registered in 25+ countries — <strong>yet in only a handful of national treatment guidelines.</strong> Its bottleneck is stage 5, policy adoption. The ten-year gap between EMA opinion and WHO recommendation is exactly the kind of interval the dashboard's timing chart exposes.</p>
        </div>
        <div className="card">
          <span className="tag market">Marketed · underutilized</span>
          <h4>DHA–PPQ</h4>
          <div className="inn">dihydroartemisinin–piperaquine · Alfasigma, Guilin & others</div>
          <p>Approved 2011, WHO-recommended 2015, multiple prequalified suppliers (which is supply security) — <strong>yet a small share of global treatment procurement.</strong> Its bottleneck is stage 6, procurement. Current use concentrates in seasonal prevention niches.</p>
        </div>
        <div className="card">
          <span className="tag future">Future · prevention tool</span>
          <h4>Spatial emanators</h4>
          <div className="inn">airborne mosquito-repellent devices · SC Johnson</div>
          <p>A placeholder row, pending funder approval (Gates Foundation). A prevention product travels a <em>different</em> WHO track (PQ Vector Control, a different guideline group), so the treatment stage names above won't literally apply — a known design decision waiting on activation. Two SC Johnson emanators were WHO PQ-listed in Aug 2025, so a real gate has already been passed.</p>
        </div>
      </div>
      <h3>Who's who</h3>
      <p>One institution deserves special care: <strong>the WHO wears three separate hats</strong> in this story — recommender (its Guidelines Development Group, stage 2), quality assessor (its Prequalification Team, stage 3), and overall coordinator. The project documentation is emphatic: never conflate them. The other actors:</p>
      <ul>
        <li><strong>EMA / FDA</strong> — stringent regulators; "SRA approval" in the data almost always means the EMA's EU-M4all opinion.</li>
        <li><strong>National regulators</strong> — one per country (stage 4); the African Medicines Agency and WHO's ~90-working-day collaborative registration procedure exist to accelerate them.</li>
        <li><strong>Ministries of health / national malaria control programmes</strong> — own national treatment guidelines (stage 5).</li>
        <li><strong>Global Fund, US PMI, UNICEF, domestic budgets</strong> — the buyers (stage 6). The Global Fund's public PQR database is the record of prices and volumes.</li>
        <li><strong>Product development partnerships</strong> — MMV (the dominant malaria PDP; co-developer of GanLum and ASPY), MORU (runs the DeTACT triple-ACT programme behind ALAQ), DNDi.</li>
        <li><strong>Manufacturers</strong> — Novartis, Fosun Pharma, Shin Poong, Alfasigma/Guilin, SC Johnson.</li>
        <li><strong>Unitaid</strong> — funds LAUNCH itself; <strong>RBM Partnership to End Malaria</strong> — will host the dashboard; the <strong>LAUNCH team</strong> supplies the analyst judgement behind each product's current position and bottleneck sentence.</li>
      </ul>
    </section>
  );
}
