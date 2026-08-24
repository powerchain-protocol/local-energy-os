export type InfrastructureKind = "power-plant" | "wind-farm" | "solar-plant" | "ev-charger" | "smart-meter" | "helium-hotspot";
export type MapAsset = {
  id: string;
  slug: string;
  name: string;
  kind: InfrastructureKind;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  capacityMw?: number;
  status: "online" | "degraded" | "offline" | "planned";
  network?: "solana" | "sui" | "lorawan" | "grid";
  owner?: string;
};
