export type ProtocolDomain = "METERING"|"IOT"|"INDUSTRIAL"|"EV_BACKEND"|"EV_VEHICLE"|"ROAMING"|"DEMAND_RESPONSE"|"GRID_MODEL"|"SUPPLY_CHAIN"|"MACHINE_PAYMENT"|"CROSS_CHAIN"|"ORACLE"|"SVM"|"MOVE";
export interface ProtocolDefinition { id: string; domain: ProtocolDomain; version: string; enabled: boolean; capabilities: readonly string[]; adapter: string }
export const canonicalProtocols: readonly ProtocolDefinition[] = [
  { id:"dlms",domain:"METERING",version:"IEC-62056",enabled:true,capabilities:["meter-read","load-profile"],adapter:"dlms" },
  { id:"mqtt",domain:"IOT",version:"5",enabled:true,capabilities:["telemetry","events"],adapter:"mqtt" },
  { id:"opcua",domain:"INDUSTRIAL",version:"1",enabled:true,capabilities:["scada","telemetry"],adapter:"opcua" },
  { id:"ocpp",domain:"EV_BACKEND",version:"2.1",enabled:true,capabilities:["charging","smart-charging","v2g"],adapter:"ocpp" },
  { id:"iso15118",domain:"EV_VEHICLE",version:"20",enabled:true,capabilities:["plug-and-charge","bidirectional"],adapter:"iso15118" },
  { id:"ocpi",domain:"ROAMING",version:"2.3.0",enabled:true,capabilities:["locations","tariffs","sessions","cdr"],adapter:"ocpi" },
  { id:"openadr",domain:"DEMAND_RESPONSE",version:"3",enabled:true,capabilities:["events","pricing","reports"],adapter:"openadr" },
  { id:"cim",domain:"GRID_MODEL",version:"IEC-61968/61970",enabled:true,capabilities:["topology","exchange"],adapter:"cim" },
  { id:"epcis",domain:"SUPPLY_CHAIN",version:"2.0",enabled:true,capabilities:["events","asset-provenance"],adapter:"epcis" },
  { id:"x402",domain:"MACHINE_PAYMENT",version:"current",enabled:false,capabilities:["exact","upto","batch-settlement"],adapter:"x402" },
  { id:"cctp",domain:"CROSS_CHAIN",version:"chain-aware",enabled:false,capabilities:["native-usdc"],adapter:"cctp" },
  { id:"pyth",domain:"ORACLE",version:"current",enabled:true,capabilities:["prices","confidence"],adapter:"pyth" },
  { id:"chainlink",domain:"ORACLE",version:"current",enabled:false,capabilities:["prices","ccip"],adapter:"chainlink" },
  { id:"svm",domain:"SVM",version:"current",enabled:true,capabilities:["solana","programs"],adapter:"svm" },
  { id:"sui",domain:"MOVE",version:"current",enabled:true,capabilities:["objects","move"],adapter:"sui" }
];
