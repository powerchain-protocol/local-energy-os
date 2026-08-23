export const LOCAL_ENERGY_INTEGRATIONS = [
  {id:"pyth",category:"oracle",serverOnly:true}, {id:"birdeye",category:"market-data",serverOnly:true}, {id:"coinmarketcap",category:"market-data",serverOnly:true},
  {id:"solscan",category:"explorer",serverOnly:false}, {id:"suiscan",category:"explorer",serverOnly:false}, {id:"cctp",category:"cross-chain",serverOnly:true}, {id:"x402",category:"machine-economy",serverOnly:true},
] as const;
