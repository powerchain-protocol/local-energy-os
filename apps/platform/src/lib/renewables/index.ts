import { ENERGY_ASSETS } from "@/lib/workspaces/dashboard/assets";
export function renewableCapacityMw(){return ENERGY_ASSETS.filter(asset=>asset.type==="solar"||asset.type==="wind").reduce((sum,asset)=>sum+asset.capacityMw,0);}
export function operationalRenewables(){return ENERGY_ASSETS.filter(asset=>asset.status==="online");}
export function capacityByType(){return ENERGY_ASSETS.reduce<Record<string,number>>((result,asset)=>{result[asset.type]=(result[asset.type]??0)+asset.capacityMw;return result;},{});}
