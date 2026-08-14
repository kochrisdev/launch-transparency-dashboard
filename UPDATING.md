# Updating the LAUNCH dashboard

This is the operating manual for routine data updates. The only file that changes
in a routine update is `data/products.js`.

## The update loop

1. **Edit** `data/products.js` (strict JSON after the `window.LAUNCH_DATA =` line:
   double quotes, no trailing commas).
2. **Validate**:

   ```bash
   node scripts/validate-data.js
   ```

   Fix every ERROR (the script explains each one). CI runs the same check and will
   block a push that fails it.
3. **Log it**: add an entry to the `changelog` array (newest first) —
   `{ "date": "YYYY-MM-DD", "product": "Pyramax", "change": "…" }`.
   This feeds the "Recent updates" panel that returning donors read first.
4. **Bump** `meta.lastUpdated`.
5. Commit and push.

## Rules the validator enforces (the governance layer)

- A **red (delayed) stage must carry a substantive reason** in its `note`, and the
  product must have a top-level `flag` sentence naming the bottleneck.
- A **displayed price** requires `confirmedInWriting: true` or a public `source`.
- **Unknown values are `"TBC"`** (country counts, dates) — never estimated.
  An invented number is worse than an admitted gap.
- Volume channel splits must sum to 100; missing volume data needs a `volumeNote`
  saying why.
- Every figure should carry `source` (public, citable) and `asOf` (date verified).

## Data status levels (`meta.dataStatus`)

| Value | Meaning | On-page effect |
| --- | --- | --- |
| `illustrative` | Placeholder data for design review | Blue "Design mockup" banner |
| `draft` | Compiled from public sources, pending verification | "Draft data" banner |
| `live` | Verified; manufacturer confirmations in place | No banner |

Move to `live` only when every product has been reviewed against the confirmation
register (below).

## Manufacturer confirmation register (kept OUTSIDE this repo)

`confirmedInWriting: true` may only be set when a written confirmation exists.
Keep the register in the team's document store (SharePoint/Drive), never in this
public-facing repo. Each entry should record:

- Product and the specific data point(s) covered (e.g. "indicative launch price")
- Who confirmed (name, organisation, role), and the date
- Where the written confirmation lives (link to the email/letter)
- Any conditions or expiry the manufacturer attached

When a confirmation is withdrawn or expires, flip the field back to `false` in the
same commit that removes or proxies the figure.

## Suggested cadence and ownership (fill in)

| What | Cadence | Owner |
| --- | --- | --- |
| Milestone scan (WHO PQ list, WHO guidelines news, EMA, regulator sites) | Monthly | _name_ |
| Procurement data pull (Global Fund PQR, PMI) | Quarterly | _name_ |
| Country survey refresh (registrations, guidelines, MFT) | Quarterly | _name_ |
| Manufacturer check-in and confirmation refresh | Quarterly | _name_ |
| Ad-hoc update on any public milestone event | Within 5 working days | _name_ |
| Sign-off before `dataStatus: "live"` or any price change | Per change | _name_ |
