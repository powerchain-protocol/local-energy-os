export type EnergyAsset={id:string;slug:string;name:string;type:"solar"|"wind"|"battery"|"smart-meter"|"ev";capacityMw:number;status:"online"|"maintenance"|"offline";country:string};
export const ENERGY_ASSETS:EnergyAsset[]=[
{id:"ast_sol_001",slug:"aurora-solar-one",name:"Aurora Solar One",type:"solar",capacityMw:180,status:"online",country:"Spain"},
{id:"ast_wnd_002",slug:"north-sea-wind",name:"North Sea Wind",type:"wind",capacityMw:420,status:"online",country:"Denmark"},
{id:"ast_bat_003",slug:"helsinki-grid-battery",name:"Helsinki Grid Battery",type:"battery",capacityMw:96,status:"maintenance",country:"Finland"}
];
