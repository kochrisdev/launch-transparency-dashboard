"""Data layer for the LAUNCH Streamlit app.

Pure Python (no Streamlit imports) so it can be unit-tested and reused.
Parses the same data contract as the static site: a strict-JSON object
assigned to `window.LAUNCH_DATA` in data/products.js — or plain JSON.
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from urllib.request import Request, urlopen

STATUSES = ["done", "prog", "late", "idle"]
STATUS_LABEL = {"done": "Complete", "prog": "In progress", "late": "Delayed", "idle": "Not started"}
STATUS_EMOJI = {"done": "✅", "prog": "🟡", "late": "🔴", "idle": "⚪"}
PHASES = [
    ("preclinical", "Preclinical"),
    ("phase1", "Phase I"),
    ("phase2", "Phase II"),
    ("phase3", "Phase III"),
    ("regulatory", "Regulatory review"),
    ("access", "Approved · scaling up"),
]
LEVELS = ["registered", "guidelines", "mft"]
LEVEL_LABEL = {"registered": "Registered", "guidelines": "In national guidelines", "mft": "In MFT plans"}

REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_LOCAL = REPO_ROOT / "data" / "products.js"
DEFAULT_URL = "https://kochrisdev.github.io/launch-transparency-dashboard/data/products.js"


def parse_products_text(text: str) -> dict:
    """Accept either the products.js wrapper or a bare JSON object."""
    m = re.search(r"^window\.LAUNCH_DATA\s*=\s*", text, re.M)
    body = text[m.end():] if m else text
    body = re.sub(r";?\s*$", "", body.strip())
    return json.loads(body)


def load_local(path: Path | str = DEFAULT_LOCAL) -> dict:
    return parse_products_text(Path(path).read_text(encoding="utf-8"))


def load_url(url: str = DEFAULT_URL, timeout: int = 15) -> dict:
    req = Request(url, headers={"User-Agent": "launch-streamlit/1.0"})
    with urlopen(req, timeout=timeout) as resp:  # noqa: S310 — user-chosen data URL
        return parse_products_text(resp.read().decode("utf-8"))


def validate(data: dict) -> list[str]:
    """Lightweight mirror of scripts/validate-data.js — returns issue strings."""
    issues: list[str] = []
    meta = data.get("meta", {})
    if meta.get("dataStatus") not in ("illustrative", "draft", "live"):
        issues.append("meta.dataStatus missing or invalid")
    stages = data.get("stages", [])
    if not stages:
        issues.append("stages list missing")
    for p in data.get("products", []):
        tag = p.get("id", p.get("name", "?"))
        if p.get("placeholder"):
            continue
        if len(p.get("stages", [])) != len(stages):
            issues.append(f"{tag}: expected {len(stages)} stage entries, got {len(p.get('stages', []))}")
        for i, s in enumerate(p.get("stages", [])):
            if s.get("status") not in STATUSES:
                issues.append(f"{tag}: bad status at stage {i}")
            if s.get("status") == "late" and len(s.get("note", "").strip()) < 15:
                issues.append(f"{tag}: delayed stage {i} lacks a substantive reason")
        if any(s.get("status") == "late" for s in p.get("stages", [])) and not p.get("flag"):
            issues.append(f"{tag}: has a delayed stage but no bottleneck flag")
        price = p.get("detail", {}).get("price") or {}
        shown = str(price.get("value") or "TBC").strip() not in ("TBC", "TBD", "—", "-", "")
        if shown and not price.get("confirmedInWriting") and not price.get("source"):
            issues.append(f"{tag}: displayed price lacks confirmation or public source")
    return issues


def tracked(data: dict) -> list[dict]:
    return [p for p in data.get("products", []) if not p.get("placeholder")]


def placeholders(data: dict) -> list[dict]:
    return [p for p in data.get("products", []) if p.get("placeholder")]


# ---------- dataframe builders (return list-of-dict rows; app wraps in pandas) ----------

def stage_rows(data: dict) -> list[dict]:
    rows = []
    for p in tracked(data):
        for i, s in enumerate(p["stages"]):
            rows.append({
                "Product": p["name"],
                "Stage": data["stages"][i],
                "StageIndex": i,
                "Status": STATUS_LABEL[s["status"]],
                "StatusKey": s["status"],
                "Note": s.get("note", ""),
                "Date": s.get("date", ""),
                "Next step": s.get("next", ""),
                "Anticipated": s.get("nextDate", ""),
                "Source": s.get("source", ""),
                "As of": s.get("asOf", ""),
            })
    return rows


def milestone_rows(data: dict) -> list[dict]:
    rows = []
    for p in tracked(data):
        for m in p["detail"].get("milestones", []):
            rows.append({
                "Product": p["name"],
                "Milestone": m["milestone"],
                "Status": STATUS_LABEL[m["status"]],
                "StatusKey": m["status"],
                "Label": m.get("label", ""),
                "Date": m.get("date", ""),
                "Next step": m.get("next", ""),
                "Anticipated": m.get("anticipated", ""),
                "Source": m.get("source", ""),
            })
    return rows


def country_rows(data: dict) -> list[dict]:
    rows = []
    for p in tracked(data):
        c = p["detail"].get("countries")
        if not c:
            continue
        for e in c.get("list", []):
            rows.append({
                "Product": p["name"],
                "iso3": e["iso3"],
                "Level": e["level"],
                "LevelLabel": LEVEL_LABEL[e["level"]],
                "LevelRank": LEVELS.index(e["level"]) + 1,
                "DataStatus": c.get("status", "illustrative"),
                "Note": c.get("note", ""),
            })
    return rows


def journey_segments(data: dict, good_max: int = 2, warn_max: int = 5) -> list[dict]:
    """Gate-to-gate segments for the timing chart. Pending gates run to lastUpdated year."""
    now_year = int(data["meta"]["lastUpdated"][:4])
    segs = []
    for p in tracked(data):
        gates = p["detail"].get("journey", [])
        dated = [g for g in gates if isinstance(g["year"], int)]
        if len(dated) < 2:
            continue
        for a, b in zip(dated, dated[1:]):
            gap = b["year"] - a["year"]
            if gap == 0:
                continue
            cls = "On track (≤{}y)".format(good_max) if gap <= good_max else (
                "Slow ({}–{}y)".format(good_max + 1, warn_max) if gap <= warn_max else "Delayed (>{}y)".format(warn_max))
            segs.append({"Product": p["name"], "From": a["label"], "To": b["label"],
                         "StartYear": a["year"], "EndYear": b["year"], "Years": gap, "Pace": cls})
        if any(g["year"] == "TBC" for g in gates) and dated[-1]["year"] < now_year:
            segs.append({"Product": p["name"], "From": dated[-1]["label"], "To": "next gate (pending)",
                         "StartYear": dated[-1]["year"], "EndYear": now_year,
                         "Years": now_year - dated[-1]["year"], "Pace": "Pending"})
    return segs
