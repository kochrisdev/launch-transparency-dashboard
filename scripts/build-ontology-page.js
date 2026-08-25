#!/usr/bin/env node
// Builds ontology/index.html — the human-browsable rendering of the
// ontology (classes, properties, vocabularies, governance shapes) — from
// ontology/launch.ttl and ontology/launch-shapes.ttl.
//
//   node scripts/build-ontology-page.js
//
// Generated output: rerun after any edit to the two Turtle files, never
// hand-edit ontology/index.html. Zero dependencies, like every script here.

const fs = require("fs");
const path = require("path");

const ONT = path.join(__dirname, "..", "ontology");
const OUT = path.join(ONT, "index.html");
const SITE = "https://kochrisdev.github.io/launch-transparency-dashboard";

// ---- minimal Turtle tokenizer -----------------------------------------------
// Handles the subset our hand-authored files use: prefixed names, <IRIs>,
// "strings" (with \" escapes, optional ^^datatype), numbers, booleans,
// punctuation . ; , [ ] ( ), and # comments outside strings.
function tokenize(src) {
  const toks = [];
  let i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i];
    if (c === "#") { while (i < n && src[i] !== "\n") i++; continue; }
    if (/\s/.test(c)) { i++; continue; }
    if (c === '"') {
      let j = i + 1, s = "";
      while (j < n && src[j] !== '"') {
        if (src[j] === "\\") { s += src[j + 1]; j += 2; } else { s += src[j]; j++; }
      }
      i = j + 1;
      if (src.slice(i, i + 2) === "^^") { // skip datatype suffix
        i += 2;
        while (i < n && /[\w:.-]/.test(src[i])) i++;
      }
      toks.push({ t: "str", v: s });
      continue;
    }
    if (c === "<") {
      const j = src.indexOf(">", i);
      toks.push({ t: "iri", v: src.slice(i + 1, j) });
      i = j + 1;
      continue;
    }
    if (".;,[]()".includes(c)) {
      // A '.' inside a prefixed name (e.g. version "1.0.0" is a string, but
      // numbers like 1.5) — handled below by the number branch first.
      toks.push({ t: "punct", v: c });
      i++;
      continue;
    }
    // number, boolean, keyword 'a', or prefixed name
    let j = i;
    while (j < n && !/[\s;,\]\)#"]/.test(src[j])) j++;
    let word = src.slice(i, j);
    // a trailing '.' ends the statement unless it's part of a number
    if (word.endsWith(".") && !/^\d+\.\d+$/.test(word)) {
      word = word.slice(0, -1);
      j--;
    }
    toks.push({ t: "word", v: word });
    i = j;
  }
  return toks;
}

// Groups tokens into statements (subject + flat predicate/object pairs at
// depth 0, plus the full token list for nested inspection).
function parseStatements(src) {
  const toks = tokenize(src).filter((t) => !(t.t === "word" && (t.v.startsWith("@prefix") || t.v === "")));
  // drop @prefix lines: "@prefix", "pfx:", <iri>, "."
  const clean = [];
  for (let i = 0; i < toks.length; i++) {
    if (toks[i].t === "word" && toks[i].v === "@prefix") { i += 2; while (toks[i] && !(toks[i].t === "punct" && toks[i].v === ".")) i++; continue; }
    clean.push(toks[i]);
  }
  const statements = [];
  let cur = null, depth = 0, pred = null;
  for (const tk of clean) {
    if (!cur) {
      cur = { subject: tk.v, props: {}, toks: [] , order: statements.length };
      pred = null;
      continue;
    }
    cur.toks.push(tk);
    if (tk.t === "punct") {
      if (tk.v === "[" || tk.v === "(") depth++;
      else if (tk.v === "]" || tk.v === ")") depth--;
      else if (tk.v === "." && depth === 0) { statements.push(cur); cur = null; }
      else if (tk.v === ";" && depth === 0) pred = null;
      continue;
    }
    if (depth > 0) continue; // nested content captured in toks only
    if (pred === null && tk.t === "word") { pred = tk.v === "a" ? "rdf:type" : tk.v; continue; }
    if (pred !== null) (cur.props[pred] = cur.props[pred] || []).push(tk.v);
  }
  return statements;
}

const esc = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const first = (st, p) => (st.props[p] || [])[0] || "";
const local = (pn) => pn.includes(":") ? pn.split(":").pop() : pn;

// ---- read the two files -------------------------------------------------------
const ontSrc = fs.readFileSync(path.join(ONT, "launch.ttl"), "utf8");
const shapesSrc = fs.readFileSync(path.join(ONT, "launch-shapes.ttl"), "utf8");
const stmts = parseStatements(ontSrc);

const header = stmts.find((s) => s.subject.startsWith("http") && (s.props["rdf:type"] || []).includes("owl:Ontology"));
const version = header ? first(header, "owl:versionInfo") : "";
const description = header ? first(header, "dcterms:description") : "";

const classes = stmts.filter((s) => (s.props["rdf:type"] || []).includes("owl:Class"));
const objProps = stmts.filter((s) => (s.props["rdf:type"] || []).includes("owl:ObjectProperty"));
const dataProps = stmts.filter((s) => (s.props["rdf:type"] || []).includes("owl:DatatypeProperty"));
const schemes = stmts.filter((s) => (s.props["rdf:type"] || []).includes("skos:ConceptScheme"));
const concepts = stmts.filter((s) => (s.props["rdf:type"] || []).includes("skos:Concept"));

// ---- shapes summary -----------------------------------------------------------
const shapeStmts = parseStatements(shapesSrc).filter((s) => (s.props["rdf:type"] || []).includes("sh:NodeShape"));
const shapes = shapeStmts.map((s) => {
  const messages = [];
  let severity = "sh:Violation";
  for (let i = 0; i < s.toks.length; i++) {
    const tk = s.toks[i], nx = s.toks[i + 1];
    if (tk.t === "word" && tk.v === "sh:message" && nx && nx.t === "str") messages.push(nx.v);
    if (tk.t === "word" && tk.v === "sh:severity" && nx) severity = nx.v;
  }
  return { name: s.subject, target: first(s, "sh:targetClass"), severity, messages };
});

// ---- render helpers -------------------------------------------------------------
const termRow = (s, extra) => `
      <tr id="${esc(local(s.subject))}">
        <td class="term"><code>${esc(s.subject)}</code>${first(s, "rdfs:label") ? `<span class="lbl">${esc(first(s, "rdfs:label") || first(s, "skos:prefLabel"))}</span>` : ""}</td>
        ${extra}
        <td class="desc">${esc(first(s, "rdfs:comment") || first(s, "skos:definition"))}</td>
      </tr>`;

const classRows = classes.map((s) => termRow(s, `
        <td>${(s.props["rdfs:subClassOf"] || []).map((c) => `<code>${esc(c)}</code>`).join(", ") || "—"}</td>`)).join("");

const propRows = (list) => list.map((s) => termRow(s, `
        <td><code>${esc(first(s, "rdfs:domain") || "—")}</code> → <code>${esc(first(s, "rdfs:range") || "—")}</code>${first(s, "rdfs:subPropertyOf") ? `<div class="sub">⊑ <code>${esc(first(s, "rdfs:subPropertyOf"))}</code></div>` : ""}</td>`)).join("");

const schemeBlocks = schemes.map((sch) => {
  const members = concepts.filter((c) => first(c, "skos:inScheme") === sch.subject);
  const rows = members.map((c) => {
    const rank = first(c, "launch:statusRank") || first(c, "launch:levelRank");
    return `<tr>
        <td><code>${esc(first(c, "skos:notation"))}</code></td>
        <td>${esc(first(c, "skos:prefLabel"))}${rank !== "" ? ` <span class="rank">rank ${esc(rank)}</span>` : ""}</td>
        <td class="desc">${esc(first(c, "skos:definition"))}</td>
      </tr>`;
  }).join("");
  const generated = !members.length;
  return `
    <section class="scheme" id="${esc(local(sch.subject))}">
      <h3>${esc(first(sch, "skos:prefLabel"))} <code class="dim">${esc(sch.subject)}</code></h3>
      <p>${esc(first(sch, "skos:definition"))}</p>
      ${generated
        ? `<p class="gen">Concepts are generated into <a href="launch-data.jsonld">launch-data.jsonld</a> from the data file itself, so they can never drift from the contract.</p>`
        : `<div class="tablewrap"><table><thead><tr><th>notation</th><th>label</th><th>definition</th></tr></thead><tbody>${rows}</tbody></table></div>`}
    </section>`;
}).join("");

const shapeRows = shapes.map((sh) => `
      <tr>
        <td class="term"><code>${esc(sh.name)}</code></td>
        <td><code>${esc(sh.target)}</code></td>
        <td>${sh.severity === "sh:Warning" ? '<span class="warn">Warning</span>' : '<span class="viol">Violation</span>'}</td>
        <td class="desc">${sh.messages.map((m) => esc(m)).join("<br>")}</td>
      </tr>`).join("");

// ---- page ------------------------------------------------------------------------
const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>LAUNCH Dashboard Ontology</title>
<meta name="description" content="${esc(description)}">
<style>
  :root {
    --bg: #ffffff; --fg: #1e2430; --muted: #5b6675; --line: #e3e7ee;
    --accent: #0e7c66; --card: #f6f8fa; --code-bg: #eef1f5; --warn: #9a6700; --viol: #b3261e;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #12161d; --fg: #e6eaf1; --muted: #9aa5b4; --line: #2a3140;
      --accent: #3ecfae; --card: #191f29; --code-bg: #222a37; --warn: #d4a72c; --viol: #f2857c;
    }
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--fg);
    font: 16px/1.6 system-ui, "Segoe UI", Roboto, sans-serif; }
  .wrap { max-width: 1080px; margin: 0 auto; padding: 40px 24px 80px; }
  header h1 { font-size: 1.9rem; margin: 0 0 4px; }
  header .kicker { color: var(--accent); font-weight: 600; letter-spacing: .08em;
    text-transform: uppercase; font-size: .78rem; }
  header .meta { color: var(--muted); margin: 6px 0 14px; }
  .files { display: flex; flex-wrap: wrap; gap: 8px; margin: 14px 0 8px; }
  .files a { display: inline-block; padding: 6px 12px; border: 1px solid var(--line);
    border-radius: 8px; background: var(--card); color: var(--fg); text-decoration: none;
    font-size: .88rem; }
  .files a:hover { border-color: var(--accent); }
  h2 { font-size: 1.3rem; margin: 44px 0 6px; padding-top: 10px; border-top: 1px solid var(--line); }
  h2 .count { color: var(--muted); font-weight: 400; font-size: .95rem; }
  h3 { font-size: 1.05rem; margin: 26px 0 4px; }
  p.lead { color: var(--muted); margin: 4px 0 16px; }
  code { background: var(--code-bg); border-radius: 5px; padding: 1px 6px; font-size: .84em; }
  code.dim { background: none; color: var(--muted); font-weight: 400; }
  pre { background: var(--card); border: 1px solid var(--line); border-radius: 10px;
    padding: 14px 16px; overflow-x: auto; font-size: .85rem; line-height: 1.5; }
  pre code { background: none; padding: 0; }
  .tablewrap { overflow-x: auto; }
  table { border-collapse: collapse; width: 100%; font-size: .92rem; }
  th { text-align: left; color: var(--muted); font-weight: 600; font-size: .8rem;
    text-transform: uppercase; letter-spacing: .05em; }
  th, td { padding: 9px 12px 9px 0; border-bottom: 1px solid var(--line); vertical-align: top; }
  td.term { white-space: nowrap; }
  td.term .lbl { display: block; color: var(--muted); font-size: .85rem; }
  td.desc { color: var(--muted); }
  .sub { color: var(--muted); font-size: .85rem; }
  .rank { color: var(--accent); font-size: .8rem; }
  .warn { color: var(--warn); font-weight: 600; }
  .viol { color: var(--viol); font-weight: 600; }
  .gen { color: var(--muted); font-style: italic; }
  section.scheme { margin-bottom: 10px; }
  a { color: var(--accent); }
  footer { margin-top: 56px; color: var(--muted); font-size: .85rem;
    border-top: 1px solid var(--line); padding-top: 14px; }
</style>
</head>
<body>
<div class="wrap">
  <header>
    <div class="kicker">LAUNCH Transparency Dashboard · Semantic layer</div>
    <h1>LAUNCH Dashboard Ontology</h1>
    <div class="meta">Version ${esc(version)} · namespace <code>${SITE}/ontology/launch.ttl#</code></div>
    <p class="lead">${esc(description)}</p>
    <div class="files">
      <a href="launch.ttl">launch.ttl — the ontology (Turtle)</a>
      <a href="context.jsonld">context.jsonld — JSON-LD context</a>
      <a href="launch-shapes.ttl">launch-shapes.ttl — governance shapes (SHACL)</a>
      <a href="launch-data.jsonld">launch-data.jsonld — the dataset as linked data</a>
      <a href="../">the dashboard</a>
      <a href="https://github.com/kochrisdev/launch-transparency-dashboard/blob/main/docs/ontology.md">full guide (docs/ontology.md)</a>
    </div>
  </header>

  <h2>Classes <span class="count">· ${classes.length}</span></h2>
  <div class="tablewrap"><table>
    <thead><tr><th>term</th><th>subclass of</th><th>meaning</th></tr></thead>
    <tbody>${classRows}
    </tbody>
  </table></div>

  <h2>Object properties <span class="count">· ${objProps.length}</span></h2>
  <div class="tablewrap"><table>
    <thead><tr><th>term</th><th>domain → range</th><th>meaning</th></tr></thead>
    <tbody>${propRows(objProps)}
    </tbody>
  </table></div>

  <h2>Data properties <span class="count">· ${dataProps.length}</span></h2>
  <p class="lead">Any literal may carry the string <code>"TBC"</code> — honestly unknown, never
  estimated, never coerced to 0 or null.</p>
  <div class="tablewrap"><table>
    <thead><tr><th>term</th><th>domain → range</th><th>meaning</th></tr></thead>
    <tbody>${propRows(dataProps)}
    </tbody>
  </table></div>

  <h2>Controlled vocabularies <span class="count">· ${schemes.length} schemes</span></h2>
  ${schemeBlocks}

  <h2>Governance shapes <span class="count">· ${shapes.length}</span></h2>
  <p class="lead">The validator's rules, independently verifiable by any RDF consumer.
  <span class="viol">Violation</span> = the dashboard would lie; <span class="warn">Warning</span> = provenance debt.</p>
  <pre><code>pip install pyshacl
pyshacl -s ${SITE}/ontology/launch-shapes.ttl \\
        -e ${SITE}/ontology/launch.ttl \\
        ${SITE}/ontology/launch-data.jsonld</code></pre>
  <div class="tablewrap"><table>
    <thead><tr><th>shape</th><th>targets</th><th>severity</th><th>enforces</th></tr></thead>
    <tbody>${shapeRows}
    </tbody>
  </table></div>

  <h2>Query it</h2>
  <p class="lead">The accountability query — which products are delayed, at which gate, why,
  and which institution owns that gate:</p>
  <pre><code>PREFIX launch: &lt;${SITE}/ontology/launch.ttl#&gt;
PREFIX schema: &lt;https://schema.org/&gt;
PREFIX skos:   &lt;http://www.w3.org/2004/02/skos/core#&gt;
SELECT ?product ?stage ?reason ?owner WHERE {
  ?p launch:hasStageEntry ?e ; schema:name ?product .
  ?e launch:hasStatus launch:status-late ;
     launch:atStage ?st ;
     launch:note ?reason .
  ?st skos:prefLabel ?stage .
  OPTIONAL { ?st launch:operatedBy/schema:name ?owner }
}</code></pre>

  <footer>
    Generated by <code>scripts/build-ontology-page.js</code> from
    <code>launch.ttl</code> and <code>launch-shapes.ttl</code> — regenerate after editing them,
    never hand-edit this page. Part of the
    <a href="https://github.com/kochrisdev/launch-transparency-dashboard">LAUNCH Transparency Dashboard</a>.
  </footer>
</div>
</body>
</html>
`;

fs.writeFileSync(OUT, html);
console.log(`Wrote ${path.relative(process.cwd(), OUT)} — ${classes.length} classes, ${objProps.length} object properties, ${dataProps.length} data properties, ${schemes.length} schemes (${concepts.length} fixed concepts), ${shapes.length} shapes`);
