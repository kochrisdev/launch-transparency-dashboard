"""Edit & save tab for the LAUNCH Streamlit app.

In-app editing of the products.js data contract, following the analyst guide's
update loop: edit → validate → changelog entry + lastUpdated bump → save.
Saving writes data/products.js in the repo house style (clean git diffs) after
running the governance checks — and the real repo validator
(scripts/validate-data.js) when Node.js is available. A download button covers
deployments where the repo file isn't on the same machine.
"""

from __future__ import annotations

import copy
import json
import subprocess
import tempfile
from datetime import date
from pathlib import Path

import pandas as pd
import streamlit as st

import launch_data as ld

STAGE_FIELDS = ["status", "note", "date", "next", "nextDate", "source", "asOf"]
MILESTONE_FIELDS = ["milestone", "status", "label", "date", "next", "anticipated", "source"]
STATUS_COL = st.column_config.SelectboxColumn("status", options=ld.STATUSES, required=True)


def _gen() -> int:
    return st.session_state.setdefault("edit_gen", 0)


def _bump_gen() -> None:
    """Invalidate every edit widget so it re-initialises from the draft."""
    st.session_state["edit_gen"] = _gen() + 1


def _k(*parts: str) -> str:
    return f"edit:{_gen()}:" + ":".join(parts)


def _records(df: pd.DataFrame) -> list[dict]:
    return df.fillna("").to_dict("records")


def _int_or_tbc(raw: str):
    raw = raw.strip()
    if raw.isdigit():
        return int(raw)
    return raw or "TBC"


def _lines(text: str) -> list[str]:
    return [ln.strip() for ln in text.splitlines() if ln.strip()]


# ---------------------------------------------------------------- draft state

def _draft(loaded: dict) -> dict:
    """The working copy being edited. Re-seeded automatically when the loaded
    source changes and the draft has no edits; otherwise kept until Reset."""
    fp = json.dumps(loaded, sort_keys=True)
    if "edit_draft" not in st.session_state or (
        st.session_state.get("edit_base_fp") != fp
        and st.session_state["edit_draft"] == st.session_state.get("edit_base")
    ):
        st.session_state["edit_draft"] = copy.deepcopy(loaded)
        st.session_state["edit_base"] = copy.deepcopy(loaded)
        st.session_state["edit_base_fp"] = fp
        _bump_gen()
    return st.session_state["edit_draft"]


def _reset_draft(loaded: dict) -> None:
    st.session_state["edit_draft"] = copy.deepcopy(loaded)
    st.session_state["edit_base"] = copy.deepcopy(loaded)
    st.session_state["edit_base_fp"] = json.dumps(loaded, sort_keys=True)
    _bump_gen()


# ---------------------------------------------------------------- validation

def run_repo_validator(file_text: str) -> tuple[bool | None, str]:
    """Run scripts/validate-data.js on the serialized draft. Returns
    (passed, output); passed is None when Node or the script is unavailable."""
    validator = ld.REPO_ROOT / "scripts" / "validate-data.js"
    if not validator.exists():
        return None, "scripts/validate-data.js not found — repo validator skipped."
    tmp = Path(tempfile.gettempdir()) / "launch-draft-products.js"
    tmp.write_text(file_text, encoding="utf-8", newline="\n")
    try:
        r = subprocess.run(["node", str(validator), str(tmp)],
                           capture_output=True, text=True, timeout=60, cwd=ld.REPO_ROOT)
    except FileNotFoundError:
        return None, "Node.js not found — repo validator skipped (Python governance checks still ran)."
    finally:
        tmp.unlink(missing_ok=True)
    return r.returncode == 0, (r.stdout + r.stderr).strip()


# ---------------------------------------------------------------- section editors

def _edit_identity(p: dict, pid: str) -> None:
    c1, c2, c3 = st.columns(3)
    p["name"] = c1.text_input("Display name", value=p["name"], key=_k(pid, "name"))
    p["inn"] = c2.text_input("INN / composition", value=p["inn"], key=_k(pid, "inn"))
    p["manufacturer"] = c3.text_input("Manufacturer", value=p["manufacturer"], key=_k(pid, "mfr"))
    c1.caption(f"id: `{pid}` (stable — never renamed)")
    p["classLabel"] = c2.text_input("Chip label", value=p["classLabel"], key=_k(pid, "clabel"))


def _edit_status_row(p: dict, pid: str, stage_names: list[str]) -> None:
    c1, c2, c3 = st.columns(3)
    p["class"] = c1.selectbox("Class", ["pipeline", "market"],
                              index=["pipeline", "market"].index(p["class"]), key=_k(pid, "class"))
    phase_opts = ["(none)"] + [k for k, _ in ld.PHASES]
    cur_phase = p.get("phase") if p.get("phase") in dict(ld.PHASES) else "(none)"
    phase = c2.selectbox("Pipeline-poster phase", phase_opts,
                         index=phase_opts.index(cur_phase), key=_k(pid, "phase"),
                         help="Move forward when a development gate is passed; (none) hides the product from the poster.")
    if phase == "(none)":
        p.pop("phase", None)
    else:
        p["phase"] = phase
    cur = min(max(p.get("currentStage", 0), 0), len(stage_names) - 1)
    p["currentStage"] = stage_names.index(
        c3.selectbox("Current stage (highlighted)", stage_names, index=cur, key=_k(pid, "curstage")))
    flag = st.text_input("Bottleneck flag (red sentence — required if any stage is late)",
                         value=p.get("flag") or "", key=_k(pid, "flag"))
    p["flag"] = flag.strip() or None


def _edit_stages(p: dict, pid: str, stage_names: list[str]) -> None:
    st.markdown("**Stage track** — one row per pathway stage. A `late` status needs a "
                "substantive reason in *note* and the flag above.")
    rows = [{"Stage": stage_names[i], **{f: s.get(f, "") for f in STAGE_FIELDS}}
            for i, s in enumerate(p["stages"])]
    edited = st.data_editor(
        pd.DataFrame(rows), key=_k(pid, "stages"), hide_index=True, num_rows="fixed",
        width="stretch",
        column_config={"Stage": st.column_config.TextColumn("Stage", disabled=True),
                       "status": STATUS_COL,
                       "asOf": st.column_config.TextColumn("asOf", help="YYYY-MM-DD you last verified this")})
    for entry, row in zip(p["stages"], _records(edited)):
        for f in STAGE_FIELDS:
            if row[f] or f in entry:
                entry[f] = row[f]


def _edit_price_and_counts(p: dict, pid: str) -> None:
    d = p["detail"]
    st.markdown("**Price** — a non-TBC value needs a public *source* or *confirmed in writing* "
                "(register entry first).")
    price = d["price"]
    c1, c2, c3, c4 = st.columns([1, 2, 2, 1])
    price["value"] = c1.text_input("Value", value=price.get("value", "TBC"), key=_k(pid, "pval"))
    price["note"] = c2.text_input("Note (unit & basis)", value=price.get("note", ""), key=_k(pid, "pnote"))
    price["source"] = c3.text_input("Source", value=price.get("source", ""), key=_k(pid, "psrc"))
    price["asOf"] = c4.text_input("asOf", value=price.get("asOf", ""), key=_k(pid, "pasof"))
    price["confirmedInWriting"] = st.checkbox("Confirmed in writing by the manufacturer",
                                              value=bool(price.get("confirmedInWriting")),
                                              key=_k(pid, "pciw"))
    st.markdown("**Country counts** — integers you can source, or `TBC`. Never estimated.")
    c = d["country"]
    c1, c2, c3, c4 = st.columns(4)
    c["registered"] = _int_or_tbc(c1.text_input("Registered", value=str(c["registered"]), key=_k(pid, "creg")))
    c["inGuidelines"] = _int_or_tbc(c2.text_input("In guidelines", value=str(c["inGuidelines"]), key=_k(pid, "cgl")))
    c["inMft"] = _int_or_tbc(c3.text_input("In MFT plans", value=str(c["inMft"]), key=_k(pid, "cmft")))
    c["forecastDemand"] = c4.text_input("Forecast demand", value=str(c.get("forecastDemand", "")), key=_k(pid, "cfd"))


def _edit_narrative(p: dict, pid: str) -> None:
    d = p["detail"]
    d["useCase"] = st.text_area("Use case", value=d["useCase"], key=_k(pid, "usecase"), height=80)
    c1, c2 = st.columns(2)
    d["access"] = _lines(c1.text_area("Access & supply commitments (one per line)",
                                      value="\n".join(d["access"]), key=_k(pid, "access"), height=120))
    d["adoption"] = _lines(c2.text_area("Adoption requirements (one per line)",
                                        value="\n".join(d["adoption"]), key=_k(pid, "adoption"), height=120))


def _edit_milestones(p: dict, pid: str) -> None:
    st.markdown("**Milestones** — add or delete rows; a `done` milestone should cite a source.")
    d = p["detail"]
    rows = [{f: m.get(f, "") for f in MILESTONE_FIELDS} for m in d.get("milestones", [])]
    edited = st.data_editor(
        pd.DataFrame(rows, columns=MILESTONE_FIELDS), key=_k(pid, "milestones"),
        hide_index=True, num_rows="dynamic", width="stretch",
        column_config={"status": STATUS_COL})
    d["milestones"] = [r for r in _records(edited) if str(r["milestone"]).strip()]


def _edit_journey(p: dict, pid: str) -> None:
    d = p["detail"]
    st.markdown("**Journey gates** — chronological, verifiable dates only; `year` is a year or `TBC`.")
    if "journey" not in d:
        if st.button("Add a journey block", key=_k(pid, "addjourney")):
            d["journey"] = [{"label": "", "year": "TBC"}, {"label": "", "year": "TBC"}]
            st.rerun()
        return
    rows = [{"label": g["label"], "year": str(g["year"])} for g in d["journey"]]
    edited = st.data_editor(pd.DataFrame(rows, columns=["label", "year"]), key=_k(pid, "journey"),
                            hide_index=True, num_rows="dynamic", width="stretch")
    d["journey"] = [{"label": str(r["label"]).strip(), "year": _int_or_tbc(str(r["year"]))}
                    for r in _records(edited) if str(r["label"]).strip()]


def _edit_countries(p: dict, pid: str) -> None:
    d = p["detail"]
    st.markdown("**Country access map** — one row per country, highest level wins "
                "(`mft` > `guidelines` > `registered`).")
    if "countries" not in d:
        if st.button("Add a country-map block", key=_k(pid, "addcountries")):
            d["countries"] = {"status": "draft", "note": "", "list": []}
            st.rerun()
        return
    c = d["countries"]
    opts = ["illustrative", "draft", "verified"]
    c1, c2 = st.columns([1, 3])
    c["status"] = c1.selectbox("Data status", opts, index=opts.index(c.get("status", "illustrative")),
                               key=_k(pid, "cstatus"),
                               help="Anything but 'verified' shows a warning overlay on the map and needs a note.")
    c["note"] = c2.text_input("Warning note (what the data is and isn't)", value=c.get("note", ""),
                              key=_k(pid, "cnote"))
    rows = [{"iso3": e["iso3"], "level": e["level"]} for e in c.get("list", [])]
    edited = st.data_editor(
        pd.DataFrame(rows, columns=["iso3", "level"]), key=_k(pid, "clist"),
        hide_index=True, num_rows="dynamic", width="stretch",
        column_config={"iso3": st.column_config.TextColumn("iso3", help="3-letter uppercase ISO code"),
                       "level": st.column_config.SelectboxColumn("level", options=ld.LEVELS, required=True)})
    c["list"] = [{"iso3": str(r["iso3"]).strip().upper(), "level": r["level"]}
                 for r in _records(edited) if str(r["iso3"]).strip()]


def _edit_raw_json(products: list[dict], idx: int, pid: str) -> None:
    with st.expander("Advanced — edit this product as raw JSON (volume, research, everything)"):
        st.caption("Covers the fields without a form above (volume, volumeNote, research). "
                   "Applying replaces the whole product block.")
        text = st.text_area("Product JSON", value=json.dumps(products[idx], indent=2, ensure_ascii=False),
                            key=_k(pid, "rawjson"), height=300)
        if st.button("Apply raw JSON", key=_k(pid, "applyraw")):
            try:
                obj = json.loads(text)
            except json.JSONDecodeError as e:
                st.error(f"Not valid JSON: {e}")
                return
            if obj.get("id") != pid:
                st.error(f'The "id" must stay `{pid}` — ids are stable anchors, never renamed.')
                return
            products[idx] = obj
            _bump_gen()
            st.rerun()


def _add_delete_product(draft: dict, pid: str) -> None:
    products = draft["products"]
    with st.expander("➕ Add a product / ➖ delete this one"):
        st.markdown("**Add** — copies an existing product as the template (keeps exactly "
                    f"{len(draft['stages'])} stage entries); then edit every field.")
        c1, c2, c3 = st.columns(3)
        template = c1.selectbox("Template", [p["id"] for p in products], key=_k("tmpl"))
        new_id = c2.text_input("New id (lowercase-slug)", key=_k("newid"))
        new_name = c3.text_input("New display name", key=_k("newname"))
        if st.button("Add product", key=_k("addprod")):
            import re as _re
            if not _re.fullmatch(r"[a-z0-9-]+", new_id or ""):
                st.error("id must be lowercase letters/digits/hyphens.")
            elif any(p["id"] == new_id for p in products):
                st.error(f"id `{new_id}` already exists.")
            elif not (new_name or "").strip():
                st.error("Give the product a display name.")
            else:
                new_p = copy.deepcopy(next(p for p in products if p["id"] == template))
                new_p["id"], new_p["name"] = new_id, new_name.strip()
                products.append(new_p)
                _bump_gen()
                st.rerun()
        st.divider()
        sure = st.checkbox(f"Yes, delete **{pid}** from the dataset", key=_k(pid, "delsure"))
        if st.button("Delete product", key=_k(pid, "delprod"), disabled=not sure, type="secondary"):
            draft["products"] = [p for p in products if p["id"] != pid]
            _bump_gen()
            st.rerun()


# ---------------------------------------------------------------- save panel

def _finalize(draft: dict, log_product: str, log_change: str) -> dict:
    final = copy.deepcopy(draft)
    today = date.today().isoformat()
    final.setdefault("changelog", []).insert(0, {"date": today, "product": log_product,
                                                 "change": log_change.strip()})
    final["meta"]["lastUpdated"] = today
    return final


def _save_panel(draft: dict, loaded: dict) -> None:
    st.divider()
    st.subheader("Save")
    dirty = draft != st.session_state.get("edit_base")
    issues = ld.validate(draft)
    c1, c2 = st.columns([3, 1])
    with c1:
        if issues:
            st.error("**Governance checks failing** — fix before saving:\n\n" +
                     "\n".join(f"- {i}" for i in issues))
        else:
            st.success("All governance checks pass on the draft." +
                       ("" if dirty else " (No changes yet.)"))
    with c2:
        if st.button("↩️ Reset draft to loaded data", width="stretch"):
            _reset_draft(loaded)
            st.rerun()

    st.markdown("Every save follows the analyst-guide loop: your **changelog entry** below is "
                "added automatically (newest first) and `meta.lastUpdated` is bumped to today.")
    names = ["All"] + [p["name"] for p in draft.get("products", [])]
    c1, c2 = st.columns([1, 3])
    log_product = c1.selectbox("Changelog product", names, key=_k("logprod"))
    log_change = c2.text_input("What changed (required, ≥ 10 characters)", key=_k("logchange"))
    ready = not issues and len(log_change.strip()) >= 10

    final = _finalize(draft, log_product, log_change) if ready else None
    file_text = ld.serialize_products_js(final) if final else ""
    local_ok = ld.DEFAULT_LOCAL.exists()

    c1, c2 = st.columns(2)
    if c1.button("💾 Save to `data/products.js`", disabled=not (ready and local_ok),
                 type="primary", width="stretch",
                 help=None if local_ok else "Repo data file not found on this machine — use Download instead."):
        passed, output = run_repo_validator(file_text)
        if passed is False:
            st.error("The repo validator (`scripts/validate-data.js`) rejected the draft — not saved:")
            st.code(output)
        else:
            ld.save_local(final)
            st.cache_data.clear()
            _reset_draft(final)
            st.success("Saved to `data/products.js`. Now **commit and push** — the live site, "
                       "history snapshot, RSS feed and ontology exports update automatically.")
            if passed is True:
                st.caption("Repo validator: passed.")
            else:
                st.caption(output)
            with st.expander("Validator / governance output"):
                st.code(output if output else "OK")
    c2.download_button("⬇️ Download edited products.js", data=file_text or " ",
                       file_name="products.js", mime="text/javascript",
                       disabled=not ready, width="stretch",
                       help="For use where the repo isn't on this machine (e.g. Streamlit Cloud): "
                            "download, replace data/products.js, run the validator, commit.")
    if not ready and not issues:
        st.caption("Enter a changelog description to enable saving.")


# ---------------------------------------------------------------- entry point

def render(loaded: dict) -> None:
    draft = _draft(loaded)
    st.markdown("Edits below change a **working draft** (the other tabs keep showing the loaded "
                "data until you save). Saving validates first, then writes the repo data file — "
                "you still review and push the commit yourself, exactly as in the "
                "[analyst guide](https://github.com/kochrisdev/launch-transparency-dashboard/blob/main/docs/data-analyst-guide.md).")

    products = draft.get("products", [])
    stage_names = draft.get("stages", [])
    ids = [p["id"] for p in products]
    labels = {p["id"]: f'{p["name"]}  ·  {p["id"]}' + ("  (placeholder)" if p.get("placeholder") else "")
              for p in products}
    pid = st.selectbox("Product", ids, format_func=lambda i: labels[i], key=_k("pick"))
    idx = ids.index(pid)
    p = products[idx]

    if p.get("placeholder"):
        st.info("Placeholder row — shown greyed-out with the note. To **activate** it into a tracked "
                "product, use the raw-JSON editor: remove `placeholder` and add `class`, "
                "`currentStage`, `stages`, `flag` and `detail` (copy them from another product).")
        _edit_identity(p, pid)
        p["note"] = st.text_area("Note (shown on the row)", value=p.get("note", ""), key=_k(pid, "phnote"))
        _edit_raw_json(products, idx, pid)
    else:
        _edit_identity(p, pid)
        _edit_status_row(p, pid, stage_names)
        _edit_stages(p, pid, stage_names)
        _edit_price_and_counts(p, pid)
        _edit_narrative(p, pid)
        _edit_milestones(p, pid)
        _edit_journey(p, pid)
        _edit_countries(p, pid)
        _edit_raw_json(products, idx, pid)

    _add_delete_product(draft, pid)

    with st.expander("Dataset settings (meta)"):
        opts = ["illustrative", "draft", "live"]
        draft["meta"]["dataStatus"] = st.selectbox(
            "dataStatus (controls the site banner)", opts,
            index=opts.index(draft["meta"].get("dataStatus", "draft")), key=_k("dstatus"),
            help="Transitions are governed — see analyst guide §6 (draft → live needs sign-off).")

    _save_panel(draft, loaded)
