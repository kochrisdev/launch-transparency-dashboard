"""LAUNCH Transparency Dashboard — Streamlit platform.

Same data contract as the static site (data/products.js), rebuilt as a
configurable Python app: flexible data sources (bundled file / live URL /
upload), runtime view configuration, and interactive Plotly charts.

Run:  streamlit run app.py
"""

import json

import pandas as pd
import plotly.express as px
import streamlit as st

import launch_data as ld

st.set_page_config(page_title="LAUNCH Transparency Dashboard", page_icon="💊", layout="wide")

ACCENT = "#14657E"
STATUS_COLOR = {"done": "#1E8A5A", "prog": "#B87500", "late": "#C0392B", "idle": "#9AA8B1"}
PACE_COLOR = {}  # filled after thresholds are known

# ---------------------------------------------------------------- sidebar: data input
st.sidebar.title("💊 LAUNCH")
st.sidebar.caption("Streamlit platform · prototype")

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
    up = st.sidebar.file_uploader("products.js or .json", type=["js", "json", "txt"])
    if up is not None:
        uploaded_bytes = up.getvalue()
    else:
        st.sidebar.info("No file yet — showing the bundled repo file.")

try:
    data = _load(source, url, uploaded_bytes)
except Exception as e:  # noqa: BLE001 — any load/parse failure is a user-facing condition
    st.error(f"Could not load data from **{source}**: {e}")
    st.stop()

issues = ld.validate(data)
with st.sidebar.expander(f"Data checks ({len(issues)} issue{'s' if len(issues) != 1 else ''})",
                         expanded=bool(issues)):
    if issues:
        for i in issues:
            st.warning(i, icon="⚠️")
    else:
        st.success("All governance checks pass.")

# ---------------------------------------------------------------- sidebar: configuration
with st.sidebar.expander("Configuration", expanded=False):
    products_all = [p["name"] for p in ld.tracked(data)]
    picked = st.multiselect("Products", products_all, default=products_all)
    good_max = st.slider("Timing: 'on track' up to (years)", 1, 4, 2)
    warn_max = st.slider("Timing: 'slow' up to (years)", good_max + 1, 10, max(5, good_max + 1))
    hide_unverified_map = st.toggle("Hide map until country data is verified", value=False,
                                    help="Governance option: suppress the choropleth entirely while countries.status is not 'verified'.")

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
left, right = st.columns([3, 1])
with left:
    st.title("LAUNCH Transparency Dashboard")
    st.caption("Tracking new antimalarial medicines from approval to access — where each product "
               "stands, and where it is stuck. **Prototype — data presented here may not be accurate.**")
with right:
    st.metric("Medicines tracked", len(tracked))
    n_late = sum(1 for p in tracked if any(s["status"] == "late" for s in p["stages"]))
    st.metric("Active bottlenecks", n_late)

BANNERS = {
    "illustrative": ("Design mockup — all values are illustrative placeholders, not real programme data.", st.info),
    "draft": ("Draft data — compiled from public sources, pending LAUNCH verification and manufacturer "
              "written confirmation. Unverified values are TBC, never estimated.", st.warning),
}
if meta["dataStatus"] in BANNERS:
    text, fn = BANNERS[meta["dataStatus"]]
    fn(text, icon="ℹ️")
st.caption(f"Last updated **{meta['lastUpdated']}** · data status **{meta['dataStatus']}** · "
           f"to be hosted by the RBM Partnership to End Malaria")

# ---------------------------------------------------------------- tabs
tab_board, tab_matrix, tab_map, tab_timing, tab_pipeline, tab_data = st.tabs(
    ["Journey board", "Comparison matrix", "Country map", "Pathway timing", "Pipeline poster", "Data & export"])

# ---------- journey board ----------
with tab_board:
    for p in tracked:
        cols = st.columns([2, 5])
        with cols[0]:
            st.subheader(p["name"])
            st.caption(f"{p['inn']}  \n{p['manufacturer']}  \n`{p['classLabel']}`")
        with cols[1]:
            lights = " → ".join(
                f"{ld.STATUS_EMOJI[s['status']]} {data['stages'][i]}"
                for i, s in enumerate(p["stages"]))
            st.markdown(lights)
            if p.get("flag"):
                st.error(f"▲ {p['flag']}", icon="🚩")
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
        st.divider()
    if placeholders:
        for p in placeholders:
            st.caption(f"⏳ **Coming next: {p['name']}** ({p['manufacturer']}) — {p['note']}")

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
                          margin=dict(l=10, r=10, t=10, b=10))
        st.plotly_chart(fig, width="stretch")
        st.caption("✅ complete · 🟡 in progress · 🔴 delayed · ⚪ not started — hover a cell for the status note.")
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
            fig.update_layout(height=480, margin=dict(l=0, r=0, t=0, b=0),
                              legend_title_text="Access level")
            st.plotly_chart(fig, width="stretch")

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
        fig.update_layout(height=320, margin=dict(l=10, r=10, t=10, b=10),
                          legend_title_text="Pace between gates")
        st.plotly_chart(fig, width="stretch")
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
                        f"<div style='border-left:5px solid {color};padding:8px 10px;"
                        f"background:#fff;border:1px solid #D8E0E4;border-left-width:5px;"
                        f"border-radius:8px;margin-bottom:8px'>"
                        f"<b>{p['name']}</b>{flag}<br><small>{p['inn']}</small><br>"
                        f"<small style='color:#7C8E99'>{p['manufacturer']}</small></div>",
                        unsafe_allow_html=True)
    if placeholders:
        st.caption("Prevention — vector control: " + "; ".join(
            f"**{p['name']}** ({p['manufacturer']}) — phase placement pending funder approval"
            for p in placeholders))
    st.caption("🔴 = active bottleneck. Format follows MMV's antimalarial pipeline poster convention.")

# ---------- data & export ----------
with tab_data:
    sdf = pd.DataFrame([r for r in ld.stage_rows(data) if r["Product"] in picked])
    mdf = pd.DataFrame([r for r in ld.milestone_rows(data) if r["Product"] in picked])
    st.markdown("**Stages**")
    st.dataframe(sdf.drop(columns=["StatusKey", "StageIndex"]), width="stretch", hide_index=True)
    st.markdown("**Milestones**")
    st.dataframe(mdf.drop(columns=["StatusKey"]), width="stretch", hide_index=True)
    c1, c2, c3 = st.columns(3)
    c1.download_button("Download stages CSV", sdf.to_csv(index=False).encode("utf-8-sig"),
                       f"launch-stages-{meta['lastUpdated']}.csv", "text/csv")
    c2.download_button("Download milestones CSV", mdf.to_csv(index=False).encode("utf-8-sig"),
                       f"launch-milestones-{meta['lastUpdated']}.csv", "text/csv")
    c3.download_button("Download raw JSON", json.dumps(data, indent=2).encode("utf-8"),
                       f"launch-data-{meta['lastUpdated']}.json", "application/json")
    if data.get("changelog"):
        st.markdown("**Recent updates**")
        st.dataframe(pd.DataFrame(data["changelog"]), width="stretch", hide_index=True)

st.caption("---\nThe LAUNCH dashboard displays publicly available information only; product details appear "
           "solely where the manufacturer confirmed release in writing. A LAUNCH initiative of Unitaid "
           "partners, to be hosted by the RBM Partnership to End Malaria.")
