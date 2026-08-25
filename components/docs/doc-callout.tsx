import type { ReactNode } from "react";
export function DocCallout({ title, children }: { title: string; children: ReactNode }) {
  return <aside className="doc-callout"><strong>{title}</strong><div>{children}</div></aside>;
}
