import { Shell } from "@/components/shell";
import { TokenDetails, TokenMiniHero, TokenTabs } from "@/components/tokenomics";
import { tokenDetails } from "@/data/tokens";

export default function CarbonCreditTokenPage() {
  const token = tokenDetails.crt;
  return (
    <Shell>
      <div className="content-container space-y-6">
        <TokenTabs />
        <TokenMiniHero token={token} />
        <TokenDetails token={token} />
      </div>
    </Shell>
  );
}
