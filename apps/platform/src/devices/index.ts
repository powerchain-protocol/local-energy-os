export type Device={id:string;name:string;type:'meter'|'sensor'|'gateway';status:'online'|'offline'};
export const devices:Device[]=[{id:'GW-07',name:'Houston Gateway',type:'gateway',status:'online'},{id:'SM-204',name:'Solar Meter 204',type:'meter',status:'online'}];
