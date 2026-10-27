"use client";
import type { Ref } from "react";
import { ICON, milestones, type TrackedProduct } from "./logic";

interface Props {
  product: TrackedProduct | null;
  onClose: () => void;
  ref?: Ref<HTMLDivElement>;
}

/** Full product profile shown under the matrix when a column head is selected. */
export function Drawer({ product, onClose, ref }: Props) {
  return (
    <div className={"drawer" + (product ? " open" : "")} id="drawer" aria-live="polite" ref={ref}>
      {product ? <DrawerBody p={product} onClose={onClose} /> : null}
    </div>
  );
}

function DrawerBody({ p, onClose }: { p: TrackedProduct; onClose: () => void }) {
  const d = p.detail ?? {};
  const price = d.price ?? { value: "" };
  const country = d.country;
  const research = d.research ?? {};
  const priceProv = [
    price.source ? "Source: " + price.source : "",
    price.confirmedInWriting ? "Manufacturer-confirmed in writing" : "",
    price.asOf ? "as of " + price.asOf : "",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <button className="close" type="button" onClick={onClose}>
        Close ×
      </button>
      <h2>{p.name}</h2>
      <div className="dsub">
        {`${p.inn ?? ""} · ${p.manufacturer ?? ""}`}
      </div>
      <div className="cards">
        <div className="card">
          <h3>Indicative price per treatment</h3>
          <div className="big">{price.value}</div>
          <div className="sub">{price.note}</div>
          {priceProv ? (
            <div className="sub" style={{ marginTop: 5, fontSize: 11 }}>
              {priceProv}
            </div>
          ) : null}
        </div>
        <div className="card">
          <h3>Target use case</h3>
          <p>{d.useCase}</p>
        </div>
        <div className="card">
          <h3>Access &amp; supply commitments</h3>
          <ul>
            {(d.access ?? []).map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h3>Adoption requirements</h3>
          <ul>
            {(d.adoption ?? []).map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h3>Country access</h3>
          <KV k="Registered" v={country?.registered} />
          <KV k="In national guidelines" v={country?.inGuidelines} />
          <KV k="In MFT plans" v={country?.inMft} />
          <KV k="Forecast demand" v={country?.forecastDemand} />
        </div>
        <div className="card">
          <h3>Operational research</h3>
          <KV k="Lead" v={research.lead} />
          <KV k="Geographies" v={research.geographies} />
          <KV k="Timeline" v={research.timeline} />
          <p style={{ marginTop: 6 }}>
            <em>{research.question}</em>
          </p>
        </div>
      </div>
      <div className="mtable-box">
        <table className="mtable">
          <thead>
            <tr>
              <th>Milestone</th>
              <th>Status</th>
              <th>Date achieved / submitted</th>
              <th>Next expected step</th>
              <th>Anticipated</th>
            </tr>
          </thead>
          <tbody>
            {milestones(p).map((m, i) => (
              <tr key={i}>
                <td>{m.milestone}</td>
                <td>
                  <span className={"pill " + m.status}>
                    {(ICON[m.status] ? ICON[m.status] + " " : "") + (m.label ?? "")}
                  </span>
                </td>
                <td>{m.date}</td>
                <td>{m.next}</td>
                <td>{m.anticipated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function KV({ k, v }: { k: string; v: string | number | undefined }) {
  return (
    <div className="kv">
      <span>{k}</span>
      <span>{v == null ? "" : String(v)}</span>
    </div>
  );
}
