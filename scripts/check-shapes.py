#!/usr/bin/env python3
"""SHACL check of a projected linked-data file against the governance shapes.

    python scripts/check-shapes.py <data.jsonld> [<data.jsonld> ...]

The semantic twin of `node scripts/validate-data.js`, run in CI after a fresh
projection (`node scripts/build-ontology.js <dataset> <out.jsonld>`) so the
shapes are proven against every data change, not just claimed.

Mirrors the validator's semantics: sh:Warning results are printed but pass;
sh:Violation results fail (exit 1). The JSON-LD context is inlined from the
local ontology/context.jsonld so the check never depends on the deployed
(possibly older) context on GitHub Pages.

Requires: pip install pyshacl
"""
import json
import sys
from pathlib import Path

from pyshacl import validate
from rdflib import Graph

ROOT = Path(__file__).resolve().parent.parent
ONTOLOGY = ROOT / "ontology"

def load_data(path: Path, context: dict) -> Graph:
    doc = json.loads(path.read_text(encoding="utf8"))
    doc["@context"] = context["@context"]  # inline — no network fetch
    g = Graph()
    g.parse(data=json.dumps(doc), format="json-ld")
    return g

def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__)
        return 2
    context = json.loads((ONTOLOGY / "context.jsonld").read_text(encoding="utf8"))
    shapes = Graph().parse(ONTOLOGY / "launch-shapes.ttl", format="turtle")
    ont = Graph().parse(ONTOLOGY / "launch.ttl", format="turtle")

    failed = False
    for arg in sys.argv[1:]:
        data = load_data(Path(arg), context)
        conforms, _, text = validate(
            data, shacl_graph=shapes, ont_graph=ont, allow_warnings=True
        )
        n_viol = text.count("Severity: sh:Violation")
        n_warn = text.count("Severity: sh:Warning")
        print(f"{arg}: {'conforms' if conforms else 'FAILED'} "
              f"({n_viol} violation(s), {n_warn} warning(s))")
        if n_warn or n_viol:
            print(text)
        if not conforms:
            failed = True

    if failed:
        print("Fix the violations above — the governance shapes must hold.")
        return 1
    return 0

if __name__ == "__main__":
    sys.exit(main())
