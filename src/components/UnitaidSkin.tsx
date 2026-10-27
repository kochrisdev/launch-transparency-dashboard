// Importing this component pulls in the Unitaid brand override stylesheet.
// Import it ONLY from /unitaid/* route files, AFTER the page view import, so
// the brand tokens override the page's own :root tokens.
import "@/styles/editions/unitaid.css";
import { asset } from "@/lib/paths";

/** Official primary lockup bar — full-colour logo on white (brand rule). */
export function UnitaidSkin() {
  return (
    <div className="unitaid-logobar">
      <a href="https://unitaid.org" target="_blank" rel="noopener">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset("unitaid/assets/unitaid-logo.svg")} alt="Unitaid — save lives faster" />
      </a>
    </div>
  );
}
