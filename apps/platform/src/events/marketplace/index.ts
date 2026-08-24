import type { MarketplaceDomainEvent, MarketplaceEventName } from "@/types/marketplace";

const eventLog: MarketplaceDomainEvent[] = [];

type EventInput<T> = Omit<MarketplaceDomainEvent<T>, "id" | "occurredAt" | "version">;

export function publishMarketplaceEvent<T extends Record<string, unknown>>(
  input: EventInput<T>,
): MarketplaceDomainEvent<T> {
  const event: MarketplaceDomainEvent<T> = {
    ...input,
    id: crypto.randomUUID(),
    occurredAt: new Date().toISOString(),
    version: 1,
  };
  eventLog.push(event as MarketplaceDomainEvent);
  return event;
}

export function listMarketplaceEvents(name?: MarketplaceEventName) {
  return name ? eventLog.filter((event) => event.name === name) : [...eventLog];
}
