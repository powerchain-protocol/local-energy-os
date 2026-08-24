import type { MapAsset } from "./types";

export const mapAssets: MapAsset[] = [
  { id:"plant-fi-001", slug:"helsinki-solar-one", name:"Helsinki Solar One", kind:"solar-plant", country:"Finland", region:"Uusimaa", latitude:60.17, longitude:24.94, capacityMw:84, status:"online", network:"solana", owner:"NorthGrid Energy" },
  { id:"wind-dk-001", slug:"north-sea-wind", name:"North Sea Wind Cluster", kind:"wind-farm", country:"Denmark", region:"North Sea", latitude:56.4, longitude:7.7, capacityMw:720, status:"online", network:"grid", owner:"Nordic Wind Cooperative" },
  { id:"plant-us-001", slug:"mojave-tokenized-solar", name:"Mojave Tokenized Solar", kind:"solar-plant", country:"United States", region:"California", latitude:35.01, longitude:-115.47, capacityMw:310, status:"online", network:"solana", owner:"SunLedger Inc." },
  { id:"plant-ke-001", slug:"rift-valley-geothermal", name:"Rift Valley Geothermal", kind:"power-plant", country:"Kenya", region:"Nakuru", latitude:-0.31, longitude:36.07, capacityMw:165, status:"online", network:"grid" },
  { id:"wind-au-001", slug:"southern-cross-wind", name:"Southern Cross Wind Farm", kind:"wind-farm", country:"Australia", region:"Victoria", latitude:-37.2, longitude:144.7, capacityMw:420, status:"degraded", network:"grid" },
  { id:"ev-de-001", slug:"berlin-fast-charge-hub", name:"Berlin Fast Charge Hub", kind:"ev-charger", country:"Germany", region:"Berlin", latitude:52.52, longitude:13.4, status:"online", network:"solana" },
  { id:"meter-sg-001", slug:"singapore-smart-meter-grid", name:"Singapore Smart Meter Grid", kind:"smart-meter", country:"Singapore", region:"Central", latitude:1.35, longitude:103.82, status:"online", network:"lorawan" },
  { id:"helium-br-001", slug:"sao-paulo-helium-zone", name:"São Paulo Helium Zone", kind:"helium-hotspot", country:"Brazil", region:"São Paulo", latitude:-23.55, longitude:-46.63, status:"online", network:"lorawan" },
  { id:"plant-jp-001", slug:"hokkaido-solar-ledger", name:"Hokkaido Solar Ledger", kind:"solar-plant", country:"Japan", region:"Hokkaido", latitude:43.06, longitude:141.35, capacityMw:112, status:"planned", network:"solana" }
];

export function searchMapAssets(query:string, kind?:string){
  const term=query.trim().toLowerCase();
  return mapAssets.filter(asset => (!kind || kind==="all" || asset.kind===kind) && (!term || [asset.name,asset.country,asset.region,asset.kind,asset.owner,asset.network].filter(Boolean).some(value=>String(value).toLowerCase().includes(term))));
}
