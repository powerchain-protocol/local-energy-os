import type { EnergyCommunitySummary, LocalEnergyListing, P2POrder } from "@/types/p2p";

export const energyCommunitySummary: EnergyCommunitySummary = {
  members: 284,
  producers: 96,
  consumers: 188,
  batteries: 34,
  localSupplyKwh: 8420,
  localDemandKwh: 7180,
  matchedPercent: 86.4,
  averagePrice: 0.108,
  carbonAvoidedKg: 2082,
};

export const localEnergyListings: LocalEnergyListing[] = [
  {id:"p2p-sol-001",sellerId:"org-helsinki-solar",sellerName:"Helsinki Solar Cooperative",sellerRating:4.9,mode:"sell",source:"solar",title:"Midday rooftop solar surplus",location:"Helsinki, Finland",region:"Uusimaa",coordinates:{latitude:60.1699,longitude:24.9384},distanceKm:2.4,quantityKwh:480,availableKwh:316,minimumKwh:5,pricePerKwh:0.112,currency:"EUR",deliveryStart:"11:00",deliveryEnd:"16:00",renewablePercent:100,verified:true,meterVerified:true,settlementAsset:"USDC",status:"active"},
  {id:"p2p-wind-002",sellerId:"org-espoo-wind",sellerName:"Espoo Community Wind",sellerRating:4.8,mode:"sell",source:"wind",title:"Evening community wind block",location:"Espoo, Finland",region:"Uusimaa",coordinates:{latitude:60.2055,longitude:24.6559},distanceKm:11.7,quantityKwh:900,availableKwh:645,minimumKwh:10,pricePerKwh:0.098,currency:"EUR",deliveryStart:"18:00",deliveryEnd:"23:00",renewablePercent:100,verified:true,meterVerified:true,settlementAsset:"PWRC",status:"active"},
  {id:"p2p-buy-003",sellerId:"org-local-market",sellerName:"Local Energy Pool",sellerRating:4.7,mode:"buy",source:"mixed",title:"Local flexibility request",location:"Vantaa, Finland",region:"Uusimaa",coordinates:{latitude:60.2934,longitude:25.0378},distanceKm:15.2,quantityKwh:220,availableKwh:220,minimumKwh:5,pricePerKwh:0.126,currency:"EUR",deliveryStart:"17:00",deliveryEnd:"20:00",renewablePercent:85,verified:true,meterVerified:true,settlementAsset:"FIAT",status:"active"},
  {id:"p2p-rent-004",sellerId:"org-battery-share",sellerName:"Nordic Battery Share",sellerRating:4.9,mode:"rent",source:"battery",title:"50 kWh community battery capacity",location:"Helsinki, Finland",region:"Uusimaa",coordinates:{latitude:60.1901,longitude:24.9526},distanceKm:4.1,quantityKwh:50,availableKwh:50,minimumKwh:5,pricePerKwh:2.9,currency:"EUR",deliveryStart:"Today",deliveryEnd:"Monthly",renewablePercent:100,verified:true,meterVerified:true,settlementAsset:"USDC",status:"active",rental:{assetType:"battery",billingPeriod:"day",deposit:25,slotsAvailable:4}},
  {id:"p2p-rent-005",sellerId:"org-charge-share",sellerName:"ChargePoint Neighbourhood",sellerRating:4.6,mode:"rent",source:"solar",title:"Solar-powered EV charger slot",location:"Kauniainen, Finland",region:"Uusimaa",coordinates:{latitude:60.2121,longitude:24.7276},distanceKm:9.8,quantityKwh:22,availableKwh:22,minimumKwh:2,pricePerKwh:1.5,currency:"EUR",deliveryStart:"08:00",deliveryEnd:"12:00",renewablePercent:100,verified:true,meterVerified:true,settlementAsset:"PWRC",status:"active",rental:{assetType:"ev-charger",billingPeriod:"hour",deposit:10,slotsAvailable:2}}
];

export const demoP2POrders: P2POrder[] = [
  {id:"ord_local_1042",listingId:"p2p-sol-001",buyerId:"demo-user",quantityKwh:42,currency:"EUR",settlementAsset:"USDC",status:"delivering",pricing:{subtotal:4.704,networkFee:0.059,escrowReserve:0.095,total:4.858},meterReadingId:"meter_hel_1042",signature:"5Yw...P9d",createdAt:"2026-07-31T08:10:00.000Z",expiresAt:"2026-07-31T16:00:00.000Z"},
  {id:"ord_local_1031",listingId:"p2p-wind-002",buyerId:"demo-user",quantityKwh:85,currency:"EUR",settlementAsset:"PWRC",status:"settled",pricing:{subtotal:8.33,networkFee:0.104,escrowReserve:0.167,total:8.601},meterReadingId:"meter_esp_1031",signature:"3Pk...K2m",createdAt:"2026-07-30T16:40:00.000Z",expiresAt:"2026-07-30T23:00:00.000Z"}
];
