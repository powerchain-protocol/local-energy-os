export type AssetKind = "token" | "network" | "wallet" | "brand";

export type PowerChainTokenAsset = "PWRC" | "CRT" | "wPWRC";

export interface AssetSource {
  src: string;
  local: boolean;
  alt: string;
}

const LOCAL_ASSET_ROOT = "/assets";
const COINMARKETCAP_ROOT = "https://s2.coinmarketcap.com/static/img/coins/64x64";
const CRYPTOICONS_ROOT = "https://cryptoicons.cc/assets/icon";

export const TOKEN_ASSET_PATHS: Readonly<Record<PowerChainTokenAsset, string>> = {
  PWRC: "/assets/tokens/pwrc.png",
  CRT: "/assets/tokens/crt.png",
  wPWRC: "/assets/tokens/wpwrc-sui.png",
};

const coinMarketCapIds: Record<string, number> = {
  sol: 5426,
  usdc: 3408,
  sui: 20947,
};

export function normalizeAssetSymbol(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
}

export function localAssetUrl(kind: AssetKind, name: string, extension = "svg"): string {
  const directory = kind === "token" ? "tokens" : kind === "network" ? "networks" : kind === "wallet" ? "wallets" : "brand";
  return `${LOCAL_ASSET_ROOT}/${directory}/${normalizeAssetSymbol(name)}.${extension}`;
}

export function tokenAssetSources(symbol: string): AssetSource[] {
  const normalized = normalizeAssetSymbol(symbol);
  const canonicalSymbol = normalized === "wpwrc" ? "wPWRC" : normalized === "crt" || normalized === "cct" ? "CRT" : normalized === "pwrc" ? "PWRC" : undefined;
  const localPath = canonicalSymbol ? TOKEN_ASSET_PATHS[canonicalSymbol] : localAssetUrl("token", normalized);
  const sources: AssetSource[] = [
    { src: localPath, local: true, alt: `${canonicalSymbol ?? symbol.toUpperCase()} token` },
  ];

  const cmcId = coinMarketCapIds[normalized];
  if (cmcId) {
    sources.push({ src: `${COINMARKETCAP_ROOT}/${cmcId}.png`, local: false, alt: `${symbol.toUpperCase()} token` });
  }

  sources.push({ src: `${CRYPTOICONS_ROOT}/${normalized}/200`, local: false, alt: `${symbol.toUpperCase()} token` });
  return sources;
}

export function networkAssetSources(network: string): AssetSource[] {
  const normalized = normalizeAssetSymbol(network);
  return [
    { src: localAssetUrl("network", normalized), local: true, alt: `${network} network` },
    ...tokenAssetSources(normalized).filter((source) => !source.local),
  ];
}

export function walletAssetSources(wallet: string): AssetSource[] {
  const normalized = normalizeAssetSymbol(wallet);
  return [
    { src: localAssetUrl("wallet", normalized), local: true, alt: `${wallet} wallet` },
    { src: `${CRYPTOICONS_ROOT}/${normalized}/200`, local: false, alt: `${wallet} wallet` },
  ];
}
