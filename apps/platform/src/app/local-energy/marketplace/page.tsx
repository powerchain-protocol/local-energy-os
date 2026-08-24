import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Shell } from "@/components/shell";
import { P2PMarketplace } from "@/workspaces/p2p/components/p2p-marketplace";

export default function LocalEnergyMarketplacePage(){
  return <Shell><main className="pc-page"><div className="pc-container space-y-5">
    <Link href="/local-energy" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-800"><ArrowLeft className="h-4 w-4"/>Local Energy OS</Link>
    <P2PMarketplace/>
  </div></main></Shell>;
}
