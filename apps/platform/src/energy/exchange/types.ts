export type EnergyCommodity = "SOLAR_MWH" | "WIND_MWH" | "HYDRO_MWH" | "REC" | "CRT";
export type OrderSide = "buy" | "sell";
export type OrderStatus = "open" | "partially_filled" | "filled" | "cancelled";

export interface ExchangeOrder {
  id: string;
  organizationId: string;
  commodity: EnergyCommodity;
  side: OrderSide;
  quantity: number;
  limitPrice: number;
  currency: "USD" | "USDC" | "PWRC";
  status: OrderStatus;
  createdAt: string;
}

export interface MarketQuote {
  commodity: EnergyCommodity;
  bid: number;
  ask: number;
  last: number;
  change24h: number;
  volume24h: number;
}
