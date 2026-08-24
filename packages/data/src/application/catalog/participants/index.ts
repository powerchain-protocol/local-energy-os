import type {Participant} from "@/types/participants";
export const participants:Participant[]=[
{id:"org-001",slug:"nordic-solar-coop",name:"Nordic Solar Cooperative",roles:["community","provider","prosumer"],region:"Finland",status:"active",assets:42,meters:318,marketVolume:1284000,renewableShare:100,verified:true},
{id:"org-002",slug:"greenroute-logistics",name:"GreenRoute Logistics",roles:["enterprise","consumer"],region:"Nordics",status:"active",assets:18,meters:126,marketVolume:842000,renewableShare:78,verified:true},
{id:"org-003",slug:"aurora-grid",name:"Aurora Grid Services",roles:["utility","grid_operator","aggregator"],region:"Finland",status:"active",assets:92,meters:12450,marketVolume:8890000,renewableShare:64,verified:true},
{id:"org-004",slug:"polar-install",name:"Polar Energy Installations",roles:["installer","partner"],region:"Baltics",status:"pending",assets:7,meters:84,marketVolume:215000,renewableShare:91,verified:false}
];
