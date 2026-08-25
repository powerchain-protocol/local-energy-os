import { notFound } from "next/navigation";
import { DOC_PAGES, getDocPage } from "@powerchain/shared";
import { DocPage, DocsShell } from "@powerchain/docs-ui";

export function generateStaticParams() {
  return DOC_PAGES.map((page) => ({ slug: page.slug }));
}

export default async function DocumentationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getDocPage(slug);
  if (!page) notFound();
  return <DocsShell currentSlug={slug}><DocPage page={page} /></DocsShell>;
}
