export type ConnectorStatus = "connected" | "degraded" | "offline";
export interface ScadaPoint { tag: string; value: number | string | boolean; unit?: string; quality: "good" | "uncertain" | "bad"; timestamp: string }
export interface ScadaConnector { id: string; protocol: "opcua" | "mqtt" | "modbus" | "rest"; status(): Promise<ConnectorStatus>; read(tags: string[]): Promise<ScadaPoint[]>; subscribe?(tags: string[], onPoint: (point: ScadaPoint)=>void): Promise<()=>void>; }
