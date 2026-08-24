import type {ExchangeListing,ExchangeTrade,OrderBookLevel} from "@/types/exchange";
export const exchangeListings:ExchangeListing[]=[
{id:"ex-sol-001",market:"energy",title:"Community solar block",region:"Helsinki, FI",source:"Solar",quantity:420,unit:"kWh",price:0.108,currency:"EUR",seller:"Nordic Solar Cooperative",verified:true,deliveryWindow:"Today 14:00–18:00",carbonIntensity:18,latitude:60.17,longitude:24.94},
{id:"ex-bat-002",market:"storage",title:"Evening battery reserve",region:"Espoo, FI",source:"Battery",quantity:1.2,unit:"MWh",price:76,currency:"USDC",seller:"Aurora Storage Oy",verified:true,deliveryWindow:"Today 17:00–22:00",latitude:60.21,longitude:24.66},
{id:"ex-ev-003",market:"charging",title:"Fleet fast-charge capacity",region:"Vantaa, FI",source:"Solar + Grid",quantity:18,unit:"sessions",price:12.5,currency:"USD",seller:"GreenRoute Charging",verified:true,deliveryWindow:"Tomorrow 06:00–12:00",latitude:60.29,longitude:25.04},
{id:"ex-flex-004",market:"flexibility",title:"Commercial load reduction",region:"Tampere, FI",source:"Demand Response",quantity:850,unit:"kW",price:94,currency:"USD",seller:"Pirkanmaa Flex Pool",verified:true,deliveryWindow:"Tomorrow 16:00–19:00",latitude:61.5,longitude:23.76},
{id:"ex-rec-005",market:"certificate",title:"Nordic wind guarantees of origin",region:"Oulu, FI",source:"Wind",quantity:2600,unit:"MWh",price:4.8,currency:"USDC",seller:"Arctic Wind Registry",verified:true,deliveryWindow:"Q3 2026",latitude:65.01,longitude:25.47}
];
export const orderBook:OrderBookLevel[]=[...Array.from({length:5},(_,i)=>({price:Number((0.104-i*.002).toFixed(3)),quantity:180+i*70,orders:3+i,side:"buy" as const})),...Array.from({length:5},(_,i)=>({price:Number((0.110+i*.002).toFixed(3)),quantity:140+i*65,orders:2+i,side:"sell" as const}))];
export const exchangeTrades:ExchangeTrade[]=[
{id:"tr-9001",market:"energy",asset:"Solar energy",quantity:95,unit:"kWh",price:.108,currency:"USD",region:"Helsinki",settlement:"settled",executedAt:"2 min ago"},
{id:"tr-9002",market:"storage",asset:"Battery reserve",quantity:.4,unit:"MWh",price:74,currency:"USDC",region:"Espoo",settlement:"escrowed",executedAt:"7 min ago"},
{id:"tr-9003",market:"certificate",asset:"Wind GO",quantity:120,unit:"MWh",price:4.7,currency:"USDC",region:"Oulu",settlement:"validated",executedAt:"14 min ago"}
];
