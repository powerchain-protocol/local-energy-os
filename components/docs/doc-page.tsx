import type { DocPage as DocPageModel } from "@powerchain/shared";

export function DocPage({ page }: { page: DocPageModel }) {
  return (
    <article className="doc-article">
      <header className="doc-hero">
        <span className="doc-eyebrow">{page.eyebrow}</span>
        <h1>{page.title}</h1>
        <p>{page.description}</p>
      </header>
      <div className="doc-sections">
        {page.sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {section.code ? <pre><code>{section.code}</code></pre> : null}
          </section>
        ))}
      </div>
    </article>
  );
}
