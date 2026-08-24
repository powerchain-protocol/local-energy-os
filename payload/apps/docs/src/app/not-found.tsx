import Link from "next/link";
import { DocsShell } from "@/components/docs/docs-shell";

export default function NotFound() {
  return (
    <DocsShell>
      <section className="not-found">
        <span className="eyebrow">404</span>
        <h1>Documentation page not found</h1>
        <p>The requested canonical document does not exist.</p>
        <Link className="primary-button" href="/">Return to documentation</Link>
      </section>
    </DocsShell>
  );
}
