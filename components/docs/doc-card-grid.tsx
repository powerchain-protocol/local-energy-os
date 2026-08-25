import Link from "next/link";
export function DocCardGrid({ items }: { items: Array<{ href: string; title: string; description: string }> }) {
  return <div className="doc-card-grid">{items.map((item) => <Link key={item.href} href={item.href} className="doc-card"><h2>{item.title}</h2><p>{item.description}</p><span>Read documentation →</span></Link>)}</div>;
}
