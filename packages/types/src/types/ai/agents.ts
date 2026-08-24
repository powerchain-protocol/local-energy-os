export type AgentDomain="renewables"|"grid"|"tokenomics"|"carbon"|"maintenance"|"market";
export interface PowerChainAgent{id:string;name:string;domain:AgentDomain;description:string;skills:string[];modelId:string;requiresApproval:boolean;}
