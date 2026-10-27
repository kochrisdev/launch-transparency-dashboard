// Ported verbatim from explainer.html.
export function Masthead() {
  return (
    <header className="masthead">
      <div className="wrap">
        <p className="eyebrow">Knowledge product · launch-transparency-dashboard</p>
        <h1>Inside the LAUNCH Dashboard</h1>
        <p className="standfirst">A complete plain-language guide to the LAUNCH Transparency Dashboard — <strong>what problem it solves, the world it describes, how to read it, where its numbers come from, and how it is built.</strong> Each part goes one level deeper; read to your depth and stop when you have what you need.</p>
        <div className="router">
          <a href="#part-1"><span className="who">Everyone</span> 1 · Why this exists</a>
          <a href="#part-2"><span className="who">Everyone</span> 2 · The medicine's journey</a>
          <a href="#part-3"><span className="who">Users</span> 3 · Reading the dashboard</a>
          <a href="#part-4"><span className="who">Analysts</span> 4 · Where the numbers come from</a>
          <a href="#part-5"><span className="who">Developers</span> 5 · How it is built</a>
          <a href="#part-6"><span className="who">Reference</span> 6 · Glossary</a>
        </div>
      </div>
    </header>
  );
}
