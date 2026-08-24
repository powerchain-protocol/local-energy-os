import { Shell } from "@/components/shell";
import { TokenDetails, TokenMiniHero, TokenTabs } from "@/components/tokenomics";
import { tokenDetails } from "@/data/tokens";
export default function Page(){const token=tokenDetails.pwrc;return <Shell><div className="content-container space-y-6"><TokenTabs/><TokenMiniHero token={token}/><TokenDetails token={token}/></div></Shell>}
