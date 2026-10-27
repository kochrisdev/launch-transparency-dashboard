import type { AnchorHTMLAttributes } from "react";
import type { Edition, PageKey } from "@/lib/edition";
import { pageHref } from "@/lib/paths";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  page: PageKey;
  edition?: Edition;
  /** optional #fragment or ?query appended to the URL */
  suffix?: string;
};

/**
 * Link to another dashboard page. Intentionally a plain <a> (not next/link):
 * each page ships its own global stylesheet, and a full page load guarantees
 * styles from the previous page are not carried over by client navigation.
 */
export function PageLink({ page, edition = "main", suffix = "", ...rest }: Props) {
  return <a href={pageHref(page, edition) + suffix} {...rest} />;
}
