import Link from "next/link";
import { groupDocs } from "@/lib/docs";

export function DocsSidebar({ activeSlug }: { activeSlug?: string }) {
  return (
    <aside className="docs-sidebar" aria-label="Documentation navigation">
      <div className="sidebar-inner">
        {groupDocs().map(({ group, docs }) => (
          <section className="sidebar-group" key={group}>
            <h2>{group}</h2>
            <nav>
              {docs.map((doc) => (
                <Link
                  key={doc.slug}
                  href={`/${doc.slug}`}
                  aria-current={activeSlug === doc.slug ? "page" : undefined}
                  className={activeSlug === doc.slug ? "active" : undefined}
                >
                  {doc.title}
                </Link>
              ))}
            </nav>
          </section>
        ))}
      </div>
    </aside>
  );
}
