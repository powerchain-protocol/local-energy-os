export type PythPriceState = "available" | "unconfigured" | "unavailable";

export async function getPythLatestPrice(feedId?: string) {
  const observedAt = new Date().toISOString();
  const endpoint = process.env.PYTH_HERMES_URL;
  const normalizedFeed = feedId?.trim();
  if (!endpoint || !normalizedFeed) {
    return { provider: "pyth" as const, state: "unconfigured" as PythPriceState, observedAt, feedId: normalizedFeed ?? null, data: null };
  }
  if (!/^(0x)?[0-9a-fA-F]{32,128}$/.test(normalizedFeed)) {
    return { provider: "pyth" as const, state: "unavailable" as PythPriceState, observedAt, feedId: normalizedFeed, data: null, error: "INVALID_FEED_ID" };
  }
  try {
    const base = endpoint.replace(/\/$/, "");
    const url = new URL(`${base}/v2/updates/price/latest`);
    url.searchParams.append("ids[]", normalizedFeed.replace(/^0x/, ""));
    url.searchParams.set("parsed", "true");
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return { provider: "pyth" as const, state: "unavailable" as PythPriceState, observedAt, feedId: normalizedFeed, data: null, status: response.status };
    const body = await response.json() as { parsed?: Array<{ id?:string; price?:{price?:string;conf?:string;expo?:number;publish_time?:number}; ema_price?:{price?:string;conf?:string;expo?:number;publish_time?:number} }> };
    const parsed = body.parsed?.[0];
    if (!parsed?.price) return { provider: "pyth" as const, state: "unavailable" as PythPriceState, observedAt, feedId: normalizedFeed, data: null };
    return {
      provider: "pyth" as const,
      state: "available" as PythPriceState,
      observedAt,
      feedId: normalizedFeed,
      data: {
        id: parsed.id ?? normalizedFeed,
        price: parsed.price.price ?? null,
        confidence: parsed.price.conf ?? null,
        exponent: parsed.price.expo ?? null,
        publishTime: parsed.price.publish_time ?? null,
        emaPrice: parsed.ema_price?.price ?? null,
      },
    };
  } catch {
    return { provider: "pyth" as const, state: "unavailable" as PythPriceState, observedAt, feedId: normalizedFeed, data: null };
  }
}
