"use client";
import "./widget.css";
import { useSyncExternalStore } from "react";
import type { ViewProps } from "@/lib/view";
import type { LaunchData, Product } from "@/lib/types";
import type { Edition } from "@/lib/edition";
import { PageLink } from "@/components/PageLink";
import { ICON, LABEL, findProduct, productParam } from "./logic";

// Embeddable single-product tracker. Usage on a partner site:
//   <iframe src="https://<host>/widget/?product=aspy"
//           style="width:100%;max-width:720px;height:190px;border:1px solid #ddd;border-radius:10px" ...>
//
// The product comes from location.search, which doesn't exist at build time:
// the pre-rendered HTML is an empty #root and the card renders after hydration
// (the legacy page likewise started with an empty #root filled by its script).
const noopSubscribe = () => () => {};
const getSearch = () => window.location.search;
const getServerSearch = () => null;

function Track({ p, data }: { p: Product; data: LaunchData }) {
  const stages = p.stages ?? [];
  return (
    <div className="trackbox">
      <div className="track">
        {stages.map((st, i) => {
          const preDone = i > 0 && stages[i - 1].status === "done";
          const name = data.stages[i];
          return (
            <div key={i} className="stage">
              <div className="row">
                <div className={`bar pre ${preDone ? "done-bar" : ""}`}></div>
                <span className={`dot ${st.status}`} title={`${name}: ${LABEL[st.status]}`}>
                  {ICON[st.status]}
                </span>
                <div className={`bar post ${st.status === "done" ? "done-bar" : ""}`}></div>
              </div>
              <div className="lbl">{name}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Card({ p, data, edition }: { p: Product; data: LaunchData; edition: Edition }) {
  return (
    <>
      <div className="head">
        <span className="name">{p.name}</span>
        <span className="inn">{p.inn}</span>
        <span className="badge">{`Prototype · ${data.meta.dataStatus} data`}</span>
      </div>
      <Track p={p} data={data} />
      {p.flag ? <div className="flag">{p.flag}</div> : null}
      <div className="foot">
        <span>{`Updated ${data.meta.lastUpdated}`}</span>
        <span className="navlinks">
          {/* opens the full dashboard outside the embedding iframe */}
          <PageLink page="index" edition={edition} suffix={"#" + p.id} target="_blank" rel="noopener">
            Full LAUNCH dashboard →
          </PageLink>
        </span>
      </div>
    </>
  );
}

export default function Widget({ edition, data }: ViewProps) {
  const search = useSyncExternalStore(noopSubscribe, getSearch, getServerSearch);
  let body = null;
  if (search !== null) {
    const id = productParam(search);
    const tracked = data.products.filter((x) => !x.placeholder);
    const p = findProduct(tracked, id);
    body = p ? (
      <Card p={p} data={data} edition={edition} />
    ) : (
      <div className="err">
        {`LAUNCH widget: unknown product "${id}". Use ?product= one of: ${tracked.map((x) => x.id).join(", ")}.`}
      </div>
    );
  }
  return <div id="root">{body}</div>;
}
