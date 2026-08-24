import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { POWERCHAIN_PRODUCTS } from "@/data/products";
import { Shell } from "@/components/shell";
export default function ProductsPage(){return <Shell><div className="content-container space-y-6">
  <header className="copilot-product-hero"><span className="eyebrow">POWERCHAIN PRODUCTS</span><h1>One operating stack for digital energy infrastructure.</h1><p>PowerChain products share the same physical-energy authority, tenant controls, asset graph, multi-network settlement boundaries and operator experience.</p></header>
  <section className="powerchain-products-grid">{POWERCHAIN_PRODUCTS.map(product=><article className="powerchain-product-card" key={product.id}><div className="flex items-center justify-between gap-3"><span>{product.eyebrow.toUpperCase()}</span><span className="data-mode-chip live">{product.status}</span></div><h2>{product.name}</h2><p>{product.description}</p><div className="copilot-tag-row">{product.capabilities.map(capability=><span key={capability}>{capability}</span>)}</div><div className="powerchain-product-links"><Link href={product.href}>Open product <ArrowUpRight className="h-3 w-3"/></Link>{product.id==="copilot"&&<Link href="/copilot/architecture">View architecture <ArrowUpRight className="h-3 w-3"/></Link>}</div></article>)}</section>
</div></Shell>}
