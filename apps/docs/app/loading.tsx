import { PageHeader, Panel, Skeleton } from "@powerchain/ui";

export default function Loading() {
  return <main className="pc-page"><PageHeader eyebrow="PowerChain" title="Loading workspace" description="Resolving the current operational context and authoritative data sources."/><Panel><Skeleton lines={5}/></Panel></main>;
}
