import { Shell } from "@/components/shell";
import { LocalEnergyCommandCenter } from "@/components/local-energy/local-energy-command-center";

export default function LocalEnergyPage(){
  return <Shell><main className="pc-page"><div className="pc-container"><LocalEnergyCommandCenter/></div></main></Shell>;
}
