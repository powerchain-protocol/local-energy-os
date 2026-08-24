import type{PwrcBridgeDirection}from"@/types/bridge/pwrc";
export type PwrcBridgeEvent={type:"bridge.pwrc.locked"|"bridge.pwrc.burned"|"bridge.pwrc.minted"|"bridge.pwrc.released"|"bridge.pwrc.failed";transferId:string;direction:PwrcBridgeDirection;amount:string;transaction?:string;timestamp:string;}
