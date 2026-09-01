"""LAUNCH Transparency Dashboard — Streamlit platform.

Same data contract as the static site (data/products.js), rebuilt as a
configurable Python app: flexible data sources (bundled file / live URL /
upload), runtime view configuration, and interactive Plotly charts.

Run:  streamlit run app.py
"""

import html as html_mod
import json

import pandas as pd
import plotly.express as px
import streamlit as st

import edit_tab
import launch_data as ld

st.set_page_config(page_title="LAUNCH Transparency Dashboard", page_icon="💊", layout="wide")

ACCENT = "#14657E"
STATUS_COLOR = {"done": "#1E8A5A", "prog": "#B87500", "late": "#C0392B", "idle": "#9AA8B1"}
STATUS_ICON = {"done": "✓", "prog": "›", "late": "!", "idle": ""}
PLOTLY_CONFIG = {"displayModeBar": False}
E = html_mod.escape

# ---------------------------------------------------------------- brand CSS (incl. mobile)
st.markdown("""
<style>
:root {
  --lch-accent:#14657E; --lch-accent-soft:#E3EEF2; --lch-ink:#16303F; --lch-ink2:#4E6371;
  --lch-ink3:#7C8E99; --lch-line:#D8E0E4; --lch-surface:#FFFFFF; --lch-surface2:#EDF1F3;
  --lch-good:#1E8A5A; --lch-warn:#B87500; --lch-crit:#C0392B; --lch-crit-soft:#FAE7E4;
  --lch-idle:#9AA8B1; --lch-idle-soft:#EEF1F3; --lch-warn-soft:#FBF0DA;
}
#MainMenu, footer, [data-testid="stToolbar"] { visibility: hidden; height: 0; }
/* Streamlit floats a ~3.7rem header bar over the page. Keep it (the sidebar
   toggle lives there, essential on mobile) but make it a slim transparent
   strip, and pad the content below it so nothing renders underneath. */
header[data-testid="stHeader"] { background: transparent; height: 2.6rem; }
.block-container { padding-top: 3.4rem; padding-bottom: 3rem; max-width: 1200px; }

/* header */
.lch-head { display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px 12px; margin-bottom: 2px; }
.lch-title { font-size: 1.9rem; font-weight: 800; letter-spacing: -.02em; color: var(--lch-ink); }
.lch-title span { color: var(--lch-accent); }
.lch-badge { font-size: .68rem; font-weight: 650; letter-spacing: .02em; padding: 3px 10px;
  border-radius: 999px; background: var(--lch-warn-soft); color: var(--lch-warn);
  border: 1px solid var(--lch-warn); white-space: nowrap; }
.lch-sub { color: var(--lch-ink2); font-size: .92rem; margin: 2px 0 0; }
.lch-meta { color: var(--lch-ink3); font-size: .78rem; margin-top: 4px; }

/* metric cards */
[data-testid="stMetric"] { background: var(--lch-surface); border: 1px solid var(--lch-line);
  border-radius: 12px; padding: 12px 16px; box-shadow: 0 1px 2px rgba(22,48,63,.06); }
[data-testid="stMetricLabel"] { color: var(--lch-ink3); }

/* tabs */
[data-testid="stTabs"] button { font-weight: 650; }
[data-testid="stTabs"] button[aria-selected="true"] { color: var(--lch-accent); }

/* product card + stage track */
.lch-card { background: var(--lch-surface); border: 1px solid var(--lch-line); border-radius: 14px;
  box-shadow: 0 1px 2px rgba(22,48,63,.06), 0 4px 16px rgba(22,48,63,.07);
  padding: 14px 18px 10px; margin: 4px 0 2px; }
.lch-prow { display: flex; flex-wrap: wrap; gap: 10px 24px; align-items: flex-start; }
.lch-pid { min-width: 200px; flex: 1 1 200px; }
.lch-pname { font-size: 1.08rem; font-weight: 750; color: var(--lch-ink); }
.lch-pinn { font-size: .8rem; color: var(--lch-ink2); }
.lch-pmfr { font-size: .75rem; color: var(--lch-ink3); }
.lch-chip { display: inline-block; margin-top: 6px; font-size: .62rem; font-weight: 650;
  letter-spacing: .04em; text-transform: uppercase; padding: 2px 8px; border-radius: 999px;
  background: var(--lch-surface2); color: var(--lch-ink2); }
.lch-chip.pipe { background: var(--lch-accent-soft); color: var(--lch-accent); }
.lch-trackbox { flex: 3 1 380px; overflow-x: auto; }
.lch-track { display: flex; align-items: flex-start; min-width: 560px; }
.lch-st { flex: 1; min-width: 68px; text-align: center; }
.lch-strow { display: flex; align-items: center; }
.lch-bar { flex: 1; height: 3px; background: var(--lch-line); }
.lch-bar.g { background: var(--lch-good); }
.lch-st:first-child .pre, .lch-st:last-child .post { visibility: hidden; }
.lch-dot { width: 19px; height: 19px; border-radius: 50%; display: inline-flex; align-items: center;
  justify-content: center; flex: none; margin: 0 2px; font-size: 11px; font-weight: 800; color: #fff; cursor: help; }
.lch-dot.done { background: var(--lch-good); } .lch-dot.prog { background: var(--lch-warn); }
.lch-dot.late { background: var(--lch-crit); }
.lch-dot.idle { background: var(--lch-idle-soft); border: 1.5px dashed var(--lch-idle); color: var(--lch-idle); }
.lch-st.cur .lch-dot { box-shadow: 0 0 0 3px var(--lch-accent-soft); }
.lch-stlbl { font-size: .62rem; line-height: 1.25; color: var(--lch-ink3); margin-top: 5px; padding: 0 2px; }
.lch-st.cur .lch-stlbl { color: var(--lch-ink); font-weight: 650; }
.lch-flag { margin-top: 8px; font-size: .8rem; color: var(--lch-crit); }
.lch-flag::before { content: "▲ "; font-size: .6rem; }
.lch-coming { font-size: .8rem; color: var(--lch-ink3); background: var(--lch-surface);
  border: 1px dashed var(--lch-line); border-radius: 12px; padding: 10px 16px; margin-top: 10px; }

/* mobile */
@media (max-width: 640px) {
  .block-container { padding-left: .8rem; padding-right: .8rem; padding-top: 3.6rem; }
  .lch-head { flex-direction: column; align-items: flex-start; gap: 6px; }
  .lch-title { font-size: 1.35rem; }
  .lch-badge { white-space: normal; }
  .lch-card { padding: 12px 12px 8px; }
  .lch-track { min-width: 500px; }
  [data-testid="stMetric"] { padding: 8px 12px; }
}
</style>
""", unsafe_allow_html=True)

# ---------------------------------------------------------------- sidebar: data input
st.sidebar.markdown("### 💊 LAUNCH")
st.sidebar.caption("Streamlit platform · analyst workbench")

source = st.sidebar.radio(
    "Data source",
    ["Bundled repo file", "Live site (URL)", "Upload file"],
    help="All sources use the same contract: the strict-JSON object from data/products.js "
         "(the window.LAUNCH_DATA wrapper is accepted and stripped).",
)


@st.cache_data(ttl=300, show_spinner="Loading data…")
def _load(source: str, url: str, uploaded_bytes: bytes | None):
    if source == "Live site (URL)":
        return ld.load_url(url)
    if source == "Upload file" and uploaded_bytes is not None:
        return ld.parse_products_text(uploaded_bytes.decode("utf-8"))
    return ld.load_local()


url = ld.DEFAULT_URL
uploaded_bytes = None
if source == "Live site (URL)":
    url = st.sidebar.text_input("URL of products.js / .json", value=ld.DEFAULT_URL)
elif source == "Upload file":
    up = st.sidebar.file_uploader("products.js or .json", type=["js", "json", "txt"],
                                  help="Preview a draft data file before committing it.")
    if up is not None:
        uploaded_bytes = up.getvalue()
    else:
        st.sidebar.info("No file yet — showing the bundled repo file.", icon="📄")

try:
    data = _load(source, url, uploaded_bytes)
except Exception as e:  # noqa: BLE001 — any load/parse failure is a user-facing condition
    st.error(f"Could not load data from **{source}**: {e}")
    st.stop()

issues = ld.validate(data)
with st.sidebar.expander(f"🛡️ Data checks ({len(issues)} issue{'s' if len(issues) != 1 else ''})",
                         expanded=bool(issues)):
    if issues:
        for i in issues:
            st.warning(i, icon="⚠️")
    else:
        st.success("All governance checks pass.")

# ---------------------------------------------------------------- sidebar: configuration
with st.sidebar.expander("⚙️ Configuration", expanded=False):
    products_all = [p["name"] for p in ld.tracked(data)]
    picked = st.multiselect("Products", products_all, default=products_all)
    good_max = st.slider("Timing: 'on track' up to (years)", 1, 4, 2)
    warn_max = st.slider("Timing: 'slow' up to (years)", good_max + 1, 10, max(5, good_max + 1))
    hide_unverified_map = st.toggle("Hide map until country data is verified", value=False,
                                    help="Governance option: suppress the choropleth entirely while countries.status is not 'verified'.")

st.sidebar.caption("Static site: [journey board](https://kochrisdev.github.io/launch-transparency-dashboard/) · "
                   "[data story](https://kochrisdev.github.io/launch-transparency-dashboard/story.html)")

meta = data["meta"]
tracked = [p for p in ld.tracked(data) if p["name"] in picked]
placeholders = ld.placeholders(data)
PACE_COLOR = {
    f"On track (≤{good_max}y)": STATUS_COLOR["done"],
    f"Slow ({good_max + 1}–{warn_max}y)": STATUS_COLOR["prog"],
    f"Delayed (>{warn_max}y)": STATUS_COLOR["late"],
    "Pending": STATUS_COLOR["idle"],
}

# ---------------------------------------------------------------- header + banner
st.markdown(f"""
<div class="lch-head">
  <span class="lch-title"><span>LAUNCH</span> Transparency Dashboard</span>
  <span class="lch-badge">Prototype — data presented here may not be accurate</span>
</div>
<p class="lch-sub">Tracking new antimalarial medicines from approval to access — where each product
stands, and where it is stuck.</p>
<p class="lch-meta">Last updated <b>{E(meta['lastUpdated'])}</b> · data status <b>{E(meta['dataStatus'])}</b> ·
to be hosted by the RBM Partnership to End Malaria</p>
""", unsafe_allow_html=True)

BANNERS = {
    "illustrative": ("Design mockup — all values are illustrative placeholders, not real programme data.", st.info),
    "draft": ("Draft data — compiled from public sources, pending LAUNCH verification and manufacturer "
              "written confirmation. Unverified values are TBC, never estimated.", st.warning),
}
if meta["dataStatus"] in BANNERS:
    text, fn = BANNERS[meta["dataStatus"]]
    fn(text, icon="ℹ️")

# summary strip
n_late = sum(1 for p in tracked if any(s["status"] == "late" for s in p["stages"]))
n_pipe = sum(1 for p in tracked if p["class"] == "pipeline")
n_tbc = 0
for p in tracked:
    c = p["detail"]["country"]
    n_tbc += sum(1 for k in ("registered", "inGuidelines", "inMft") if c[k] == "TBC")
    n_tbc += 1 if (p["detail"]["price"]["value"] or "").strip() == "TBC" else 0
    n_tbc += 0 if p["detail"].get("volume") else 1
m1, m2, m3, m4 = st.columns(4)
m1.metric("Medicines tracked", len(tracked))
m2.metric("Active bottlenecks", n_late, delta="needs action" if n_late else None,
          delta_color="inverse" if n_late else "off")
m3.metric("Expected to market ≤ 3 yrs", n_pipe)
m4.metric("Open data gaps (TBC)", n_tbc, help="Values awaiting verification — the analyst to-do list.")

# ---------------------------------------------------------------- tabs
tab_board, tab_matrix, tab_map, tab_timing, tab_pipeline, tab_data, tab_edit = st.tabs(
    ["🚦 Journey board", "🔢 Comparison matrix", "🗺️ Country map",
     "⏱️ Pathway timing", "🧪 Pipeline poster", "📄 Data & export", "✏️ Edit & save"])


def stage_track_html(p) -> str:
    cells = []
    for i, s in enumerate(p["stages"]):
        pre = "g" if i > 0 and p["stages"][i - 1]["status"] == "done" else ""
        post = "g" if s["status"] == "done" else ""
        cur = "cur" if i == p.get("currentStage", -1) else ""
        tip = f"{ld.STATUS_LABEL[s['status']]}. {s.get('note', '')}".strip()
        cells.append(
            f'<div class="lch-st {cur}"><div class="lch-strow">'
            f'<div class="lch-bar pre {pre}"></div>'
            f'<span class="lch-dot {s["status"]}" title="{E(tip)}">{STATUS_ICON[s["status"]]}</span>'
            f'<div class="lch-bar post {post}"></div></div>'
            f'<div class="lch-stlbl">{E(data["stages"][i])}</div></div>')
    return '<div class="lch-trackbox"><div class="lch-track">' + "".join(cells) + "</div></div>"


# ---------- journey board ----------
with tab_board:
    for p in tracked:
        chip_cls = "pipe" if p["class"] == "pipeline" else ""
        flag_html = f'<div class="lch-flag">{E(p["flag"])}</div>' if p.get("flag") else ""
        st.markdown(f"""
<div class="lch-card">
  <div class="lch-prow">
    <div class="lch-pid">
      <div class="lch-pname">{E(p['name'])}</div>
      <div class="lch-pinn">{E(p['inn'])}</div>
      <div class="lch-pmfr">{E(p['manufacturer'])}</div>
      <span class="lch-chip {chip_cls}">{E(p['classLabel'])}</span>
    </div>
    {stage_track_html(p)}
  </div>
  {flag_html}
</div>""", unsafe_allow_html=True)
        with st.expander(f"{p['name']} — full profile"):
            d = p["detail"]
            c1, c2, c3, c4 = st.columns(4)
            c1.metric("Indicative price / treatment", d["price"]["value"], help=d["price"].get("note", ""))
            c2.metric("Registered countries", str(d["country"]["registered"]))
            c3.metric("In national guidelines", str(d["country"]["inGuidelines"]))
            c4.metric("In MFT plans", str(d["country"]["inMft"]))
            st.markdown(f"**Use case.** {d['useCase']}")
            cc1, cc2 = st.columns(2)
            with cc1:
                st.markdown("**Access & supply commitments**")
                for a in d["access"]:
                    st.markdown(f"- {a}")
            with cc2:
                st.markdown("**Adoption requirements**")
                for a in d["adoption"]:
                    st.markdown(f"- {a}")
            st.markdown("**Milestones**")
            mdf = pd.DataFrame([r for r in ld.milestone_rows(data) if r["Product"] == p["name"]])
            st.dataframe(mdf.drop(columns=["Product", "StatusKey"]), width="stretch", hide_index=True)
    for p in placeholders:
        st.markdown(f'<div class="lch-coming">⏳ <b>Coming next: {E(p["name"])}</b> '
                    f'({E(p["manufacturer"])}) — {E(p["note"])}</div>', unsafe_allow_html=True)

# ---------- comparison matrix ----------
with tab_matrix:
    if tracked:
        z, text, hover = [], [], []
        order = {"done": 3, "prog": 2, "late": 1, "idle": 0}
        for i, stage in enumerate(data["stages"]):
            z.append([order[p["stages"][i]["status"]] for p in tracked])
            text.append([ld.STATUS_EMOJI[p["stages"][i]["status"]] for p in tracked])
            hover.append([f"{p['name']} · {stage}<br>{ld.STATUS_LABEL[p['stages'][i]['status']]}"
                          f"<br>{p['stages'][i].get('note', '')}" for p in tracked])
        fig = px.imshow(
            z, text_auto=False, aspect="auto",
            x=[p["name"] for p in tracked], y=data["stages"],
            color_continuous_scale=[[0, "#EEF1F3"], [0.33, STATUS_COLOR["late"]],
                                    [0.66, STATUS_COLOR["prog"]], [1, STATUS_COLOR["done"]]],
        )
        fig.update_traces(text=text, texttemplate="%{text}",
                          customdata=hover, hovertemplate="%{customdata}<extra></extra>")
        fig.update_layout(coloraxis_showscale=False, height=420,
                          margin=dict(l=10, r=10, t=10, b=10),
                          font=dict(size=12))
        st.plotly_chart(fig, width="stretch", config=PLOTLY_CONFIG)
        st.caption("✅ complete · 🟡 in progress · 🔴 delayed · ⚪ not started — hover (or tap) a cell for the status note.")
        flagged = [p for p in tracked if p.get("flag")]
        if flagged:
            st.markdown("**Where products are stuck right now**")
            for p in flagged:
                st.error(f"**{p['name']}** — {p['flag']}", icon="🚩")

# ---------- country map ----------
with tab_map:
    cdf = pd.DataFrame([r for r in ld.country_rows(data) if r["Product"] in picked])
    if cdf.empty:
        st.info("No country-level data for the selected products.")
    else:
        prod = st.selectbox("Medicine", sorted(cdf["Product"].unique()))
        sub = cdf[cdf["Product"] == prod]
        unverified = (sub["DataStatus"] != "verified").any()
        if unverified and hide_unverified_map:
            st.warning("Country data for this product is not yet verified — map hidden by configuration.")
        else:
            if unverified:
                st.warning(f"ILLUSTRATIVE — {sub['Note'].iloc[0]}", icon="⚠️")
            fig = px.choropleth(
                sub, locations="iso3", color="LevelLabel",
                category_orders={"LevelLabel": [ld.LEVEL_LABEL[l] for l in ld.LEVELS]},
                color_discrete_map={"Registered": "#B7D3DD", "In national guidelines": "#5E97AC",
                                    "In MFT plans": "#14657E"},
                hover_name="iso3",
            )
            fig.update_geos(showcountries=True, countrycolor="#D8E0E4",
                            landcolor="#F5F7F8", fitbounds="locations")
            fig.update_layout(height=460, margin=dict(l=0, r=0, t=0, b=0),
                              legend=dict(orientation="h", yanchor="bottom", y=-0.06,
                                          xanchor="center", x=0.5, title_text=""))
            st.plotly_chart(fig, width="stretch", config=PLOTLY_CONFIG)

# ---------- pathway timing ----------
with tab_timing:
    segs = [s for s in ld.journey_segments(data, good_max, warn_max) if s["Product"] in picked]
    if not segs:
        st.info("No products with two or more dated gates yet.")
    else:
        sdf = pd.DataFrame(segs)
        sdf["Start"] = pd.to_datetime(sdf["StartYear"], format="%Y")
        sdf["End"] = pd.to_datetime(sdf["EndYear"], format="%Y")
        fig = px.timeline(sdf, x_start="Start", x_end="End", y="Product", color="Pace",
                          color_discrete_map=PACE_COLOR,
                          hover_data={"From": True, "To": True, "Years": True,
                                      "Start": False, "End": False, "Pace": False})
        fig.update_yaxes(autorange="reversed", title="")
        fig.update_layout(height=300, margin=dict(l=10, r=10, t=10, b=10),
                          legend=dict(orientation="h", yanchor="bottom", y=1.02, title_text=""))
        st.plotly_chart(fig, width="stretch", config=PLOTLY_CONFIG)
        st.caption(f"Benchmark (configurable in the sidebar): on track ≤ {good_max} yrs per gate; "
                   f"slow {good_max + 1}–{warn_max}; delayed beyond {warn_max}. "
                   "Grey bars run to today where the next gate is still pending.")

# ---------- pipeline poster ----------
with tab_pipeline:
    cols = st.columns(len(ld.PHASES))
    for col, (key, label) in zip(cols, ld.PHASES):
        with col:
            st.markdown(f"**{label}**")
            for p in tracked:
                if p.get("phase") == key:
                    color = STATUS_COLOR["done"] if p["class"] == "market" else ACCENT
                    flag = " 🔴" if p.get("flag") else ""
                    st.markdown(
                        f"<div style='border:1px solid var(--lch-line);border-left:5px solid {color};"
                        f"padding:8px 10px;background:var(--lch-surface);"
                        f"border-radius:8px;margin-bottom:8px'>"
                        f"<b>{E(p['name'])}</b>{flag}<br><small>{E(p['inn'])}</small><br>"
                        f"<small style='color:var(--lch-ink3)'>{E(p['manufacturer'])}</small></div>",
                        unsafe_allow_html=True)
    for p in placeholders:
        st.markdown(f'<div class="lch-coming">Prevention — vector control: <b>{E(p["name"])}</b> '
                    f'({E(p["manufacturer"])}) — phase placement pending funder approval</div>',
                    unsafe_allow_html=True)
    st.caption("🔴 = active bottleneck. Format follows MMV's antimalarial pipeline poster convention. "
               "On phones the phase columns stack vertically — read top (earliest) to bottom (latest).")

# ---------- data & export ----------
with tab_data:
    sdf = pd.DataFrame([r for r in ld.stage_rows(data) if r["Product"] in picked])
    mdf = pd.DataFrame([r for r in ld.milestone_rows(data) if r["Product"] in picked])
    st.markdown("**Stages**")
    st.dataframe(sdf.drop(columns=["StatusKey", "StageIndex"]), width="stretch", hide_index=True)
    st.markdown("**Milestones**")
    st.dataframe(mdf.drop(columns=["StatusKey"]), width="stretch", hide_index=True)
    c1, c2, c3 = st.columns(3)
    c1.download_button("⬇️ Stages CSV", sdf.to_csv(index=False).encode("utf-8-sig"),
                       f"launch-stages-{meta['lastUpdated']}.csv", "text/csv", width="stretch")
    c2.download_button("⬇️ Milestones CSV", mdf.to_csv(index=False).encode("utf-8-sig"),
                       f"launch-milestones-{meta['lastUpdated']}.csv", "text/csv", width="stretch")
    c3.download_button("⬇️ Raw JSON", json.dumps(data, indent=2).encode("utf-8"),
                       f"launch-data-{meta['lastUpdated']}.json", "application/json", width="stretch")
    if data.get("changelog"):
        st.markdown("**Recent updates**")
        st.dataframe(pd.DataFrame(data["changelog"]), width="stretch", hide_index=True)

# ---------- edit & save ----------
with tab_edit:
    edit_tab.render(data)

st.caption("The LAUNCH dashboard displays publicly available information only; product details appear "
           "solely where the manufacturer confirmed release in writing. A LAUNCH initiative of Unitaid "
           "partners, to be hosted by the RBM Partnership to End Malaria.")
