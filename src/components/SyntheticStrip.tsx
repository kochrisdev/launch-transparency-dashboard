// Importing this component pulls in the synthetic-edition warning strip
// (body::before). Import it ONLY from /synthetic/* route files.
import "@/styles/editions/synthetic.css";

export function SyntheticStrip() {
  return null;
}
