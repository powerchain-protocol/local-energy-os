export const LOCAL_ENERGY_REALTIME_TOPICS = [
  "measurement.received",
  "energy-proof.verified",
  "energy-batch.finalized",
  "energy-position.reserved",
  "trade.committed",
  "delivery.reconciled",
  "settlement.confirmed",
  "pwrc.reward.claimed",
  "bridge.wpwrc.minted",
] as const;

export type LocalEnergyRealtimeTopic = typeof LOCAL_ENERGY_REALTIME_TOPICS[number];
