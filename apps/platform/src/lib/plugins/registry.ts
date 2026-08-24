export type PluginManifest={ id:string; name:string; version:string; category:"scada"|"market"|"analytics"|"storage"|"identity"; enabled:boolean; permissions:string[] };
const registry:PluginManifest[]=[
{id:"helius",name:"Helius Solana",version:"1.0.0",category:"market",enabled:true,permissions:["wallet:read"]},
{id:"opcua",name:"OPC UA Connector",version:"1.0.0",category:"scada",enabled:true,permissions:["telemetry:write"]},
{id:"mqtt",name:"MQTT Fleet",version:"1.0.0",category:"scada",enabled:false,permissions:["telemetry:write"]}
];
export function listPlugins(){return registry;} export function setPluginEnabled(id:string,enabled:boolean){const p=registry.find(x=>x.id===id);if(p)p.enabled=enabled;return p;}
