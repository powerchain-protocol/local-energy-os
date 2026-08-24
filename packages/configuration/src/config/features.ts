export type FeatureFlag = "aiAssistant" | "carbonMarketplace" | "wallet" | "predictiveMaintenance";

const defaults: Record<FeatureFlag, boolean> = {
  aiAssistant: true,
  carbonMarketplace: false,
  wallet: true,
  predictiveMaintenance: true,
};

export function isFeatureEnabled(flag: FeatureFlag) {
  const key = `NEXT_PUBLIC_FEATURE_${flag.replace(/[A-Z]/g, (letter) => `_${letter}`).toUpperCase()}`;
  const value = process.env[key];
  return value == null ? defaults[flag] : value === "true";
}
