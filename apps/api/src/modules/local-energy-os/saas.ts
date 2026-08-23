import { resolveEntitlement, type SaaSPlan, type Subscription } from "@powerchain/saas";
export const LOCAL_ENERGY_PLANS: SaaSPlan[] = [
  { id: "community", name: "Community", applicationIds: ["energy", "grid", "mapper"], featureIds: ["p2p-market", "energy-rwa", "community"] },
  { id: "enterprise", name: "Enterprise", applicationIds: ["energy", "platform", "companies", "grid", "plants", "wind", "ev", "charging", "mapper", "supply-chain"], featureIds: ["*"] },
];
export const LOCAL_ENERGY_SUBSCRIPTIONS: Subscription[] = [];
export { resolveEntitlement };
