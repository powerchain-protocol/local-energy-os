export type ExchangeMarket = "energy"|"storage"|"charging"|"carbon"|"certificate"|"flexibility"|"capacity"|"water"|"hydrogen";
export type MarketModel = "continuous"|"auction"|"bilateral"|"scheduled"|"capacity";
export type SettlementState = "listed"|"matched"|"validated"|"reserved"|"signature_required"|"escrowed"|"delivering"|"settled"|"failed";
export interface ExchangeListing {id:string;market:ExchangeMarket;title:string;region:string;source:string;quantity:number;unit:string;price:number;currency:"USD"|"EUR"|"USDC"|"PWRC";seller:string;verified:boolean;deliveryWindow:string;carbonIntensity?:number;latitude:number;longitude:number;}
export interface OrderBookLevel {price:number;quantity:number;orders:number;side:"buy"|"sell"}
export interface ExchangeTrade {id:string;market:ExchangeMarket;asset:string;quantity:number;unit:string;price:number;currency:string;region:string;settlement:SettlementState;executedAt:string;}
