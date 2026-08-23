import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocsShell } from "@/components/docs/docs-shell";
import { MarkdownDocument } from "@/components/docs/markdown-document";
import { WhitepaperCover } from "@/components/docs/whitepaper-cover";
import { DOCS, getDocDefinition, readDoc } from "@/lib/docs";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return DOCS.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const definition = getDocDefinition(slug);
  if (!definition) return {};

  return {
    title: definition.title,
    description: definition.description,
  };
}

export default async function DocumentationPage({ params }: PageProps) {
  const { slug } = await params;
  const definition = getDocDefinition(slug);
  if (!definition) notFound();

  const document = readDoc(slug);

  return (
    <DocsShell activeSlug={slug}>
      {slug === "whitepaper" ? <WhitepaperCover /> : (
        <header className="document-header">
          <span className="eyebrow">{definition.group}</span>
          <h1>{definition.title}</h1>
          <p>{definition.description}</p>
          <span className="document-version">PowerChain Local Energy OS · v1.0.0</span>
        </header>
      )}
      <MarkdownDocument markdown={document.markdown} />
    </DocsShell>
  );
}
