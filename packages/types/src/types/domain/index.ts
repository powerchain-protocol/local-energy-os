export type Organization={id:string;name:string;slug:string;plan:"starter"|"enterprise"};
export type RenewableAsset={id:string;organizationId:string;name:string;type:"solar"|"wind"|"hydro"|"battery"|"grid";capacityMw:number;health:number;latitude:number;longitude:number;status:"online"|"maintenance"|"offline"};
export type Incident={id:string;severity:"critical"|"high"|"medium"|"low";title:string;status:"open"|"investigating"|"resolved";assetId?:string;createdAt:string};
