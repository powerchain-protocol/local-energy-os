import type { ExchangeOrder, MarketQuote } from "./types";
import { createId } from "@/utils/id";

const orders = new Map<string, ExchangeOrder>();

export function listMarketQuotes(): MarketQuote[] {
  return [
    { commodity: "SOLAR_MWH", bid: 43.72, ask: 44.05, last: 43.91, change24h: 1.8, volume24h: 12840 },
    { commodity: "WIND_MWH", bid: 39.18, ask: 39.66, last: 39.44, change24h: -0.6, volume24h: 9340 },
    { commodity: "REC", bid: 8.42, ask: 8.57, last: 8.49, change24h: 2.4, volume24h: 88200 },
    { commodity: "CRT", bid: 22.10, ask: 22.46, last: 22.31, change24h: 0.9, volume24h: 45100 }
  ];
}

export function createExchangeOrder(input: Omit<ExchangeOrder, "id" | "status" | "createdAt">): ExchangeOrder {
  if (!Number.isFinite(input.quantity) || input.quantity <= 0) throw new Error("Quantity must be greater than zero");
  if (!Number.isFinite(input.limitPrice) || input.limitPrice <= 0) throw new Error("Limit price must be greater than zero");
  const order: ExchangeOrder = { ...input, id: createId("ord"), status: "open", createdAt: new Date().toISOString() };
  orders.set(order.id, order);
  return order;
}

export function listOrganizationOrders(organizationId: string): ExchangeOrder[] {
  return [...orders.values()].filter((order) => order.organizationId === organizationId);
}
