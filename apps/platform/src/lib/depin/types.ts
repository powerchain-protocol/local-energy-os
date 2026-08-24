export type DePINNode={id:string;provider:"helium"|"powerchain";network:"lorawan"|"solana";location:string;status:"online"|"offline";rewardsPwrc:number;lastSeen:string};
export const depinNodes:DePINNode[]=[
{id:"hnt-fi-8821",provider:"helium",network:"lorawan",location:"Helsinki, FI",status:"online",rewardsPwrc:18.4,lastSeen:new Date().toISOString()},
{id:"pc-sg-1190",provider:"powerchain",network:"solana",location:"Singapore",status:"online",rewardsPwrc:31.7,lastSeen:new Date().toISOString()},
{id:"hnt-br-4402",provider:"helium",network:"lorawan",location:"São Paulo, BR",status:"online",rewardsPwrc:12.1,lastSeen:new Date().toISOString()}
];
