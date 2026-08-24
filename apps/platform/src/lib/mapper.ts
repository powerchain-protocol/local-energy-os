import type { MapNode } from './maps'; export const mapNodeToMarker=(node:MapNode)=>({...node,label:node.id,color:node.status==='normal'?'green':'amber'});
