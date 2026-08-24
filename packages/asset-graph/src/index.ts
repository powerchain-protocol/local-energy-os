import type { EnergyBatch, EnergyPosition } from "@powerchain/energy-core";
import type { EnergyRwaRecord } from "@powerchain/energy-rwa";

export const ASSET_GRAPH_VERSION = "1.0.0" as const;
export type AssetGraphNodeType = "SITE" | "GRID_AREA" | "ENERGY_BATCH" | "ENERGY_POSITION" | "CHAIN_REPRESENTATION";
export type AssetGraphEdgeType = "PRODUCES" | "LOCATED_IN" | "BACKS" | "REPRESENTED_BY";
export interface AssetGraphNode { id:string; type:AssetGraphNodeType; label:string; organizationId:string; metadata?:Record<string,string|number|boolean|null>; }
export interface AssetGraphEdge { id:string; type:AssetGraphEdgeType; from:string; to:string; }
export interface AssetGraph { version:typeof ASSET_GRAPH_VERSION; organizationId:string; generatedAt:Date; nodes:AssetGraphNode[]; edges:AssetGraphEdge[]; invariants:readonly string[]; }

export function buildEnergyAssetGraph(input:{organizationId:string;batches:readonly EnergyBatch[];positions:readonly EnergyPosition[];rwas:readonly EnergyRwaRecord[]}):AssetGraph{
  const nodes:AssetGraphNode[]=[]; const edges:AssetGraphEdge[]=[]; const ids=new Set<string>();
  const add=(node:AssetGraphNode)=>{if(!ids.has(node.id)){ids.add(node.id);nodes.push(node)}};
  for(const batch of input.batches){
    const batchId=`batch:${batch.id}`; const siteId=`site:${batch.siteId}`;
    add({id:siteId,type:"SITE",label:batch.siteId,organizationId:input.organizationId});
    add({id:batchId,type:"ENERGY_BATCH",label:batch.id,organizationId:input.organizationId,metadata:{source:batch.source,verifiedWh:batch.verifiedWh.toString(),state:batch.state}});
    edges.push({id:`${siteId}:produces:${batchId}`,type:"PRODUCES",from:siteId,to:batchId});
    if(batch.gridAreaId){const gridId=`grid:${batch.gridAreaId}`;add({id:gridId,type:"GRID_AREA",label:batch.gridAreaId,organizationId:input.organizationId});edges.push({id:`${batchId}:located:${gridId}`,type:"LOCATED_IN",from:batchId,to:gridId})}
  }
  for(const position of input.positions){
    const positionId=`position:${position.id}`; const batchId=`batch:${position.energyBatchId}`;
    add({id:positionId,type:"ENERGY_POSITION",label:position.id,organizationId:input.organizationId,metadata:{source:position.source,state:position.state,amountWh:position.amountWh.toString()}});
    if(ids.has(batchId))edges.push({id:`${batchId}:backs:${positionId}`,type:"BACKS",from:batchId,to:positionId});
  }
  for(const rwa of input.rwas){
    const positionId=`position:${rwa.position.id}`;
    for(const representation of rwa.representations){
      const repId=`representation:${representation.id}`;
      add({id:repId,type:"CHAIN_REPRESENTATION",label:`${representation.network} · ${representation.reference}`,organizationId:input.organizationId,metadata:{network:representation.network,state:representation.state,amountWh:representation.amountWh.toString(),standard:"PET-20"}});
      if(ids.has(positionId))edges.push({id:`${positionId}:represented:${repId}`,type:"REPRESENTED_BY",from:positionId,to:repId});
    }
  }
  return{version:ASSET_GRAPH_VERSION,organizationId:input.organizationId,generatedAt:new Date(),nodes,edges,invariants:["PHYSICAL_ENERGY_AUTHORITATIVE","ENERGY_POSITION_BACKED_BY_VERIFIED_BATCH","ACTIVE_SOLANA_PLUS_SUI_REPRESENTATION_NOT_GREATER_THAN_CANONICAL_POSITION"]};
}
