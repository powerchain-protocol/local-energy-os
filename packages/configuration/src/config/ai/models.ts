export type PowerChainModelKind="llm"|"lora"|"embedding"|"reranker";
export interface PowerChainAIModel{id:string;name:string;kind:PowerChainModelKind;provider:string;purpose:string;contextWindow:number;enabled:boolean;}
export const POWERCHAIN_AI_MODELS:PowerChainAIModel[]=[
{id:"gridllm-energy",name:"GridLLM Energy",kind:"llm",provider:"PowerChain",purpose:"Renewable operations, grid reasoning and market intelligence",contextWindow:128000,enabled:true},
{id:"renewables-lora",name:"Renewables LoRA",kind:"lora",provider:"PowerChain",purpose:"Solar, wind, storage and asset-performance specialization",contextWindow:128000,enabled:true},
{id:"tokenomics-lora",name:"Tokenomics LoRA",kind:"lora",provider:"PowerChain",purpose:"PWRC, wPWRC, CRT, REC, fees and treasury analysis",contextWindow:64000,enabled:true},
{id:"energy-embeddings",name:"Energy Knowledge Embeddings",kind:"embedding",provider:"PowerChain",purpose:"Documentation, telemetry and standards retrieval",contextWindow:8192,enabled:true},
];
export const DEFAULT_AI_SETTINGS={modelId:"gridllm-energy",adapterId:"renewables-lora",memory:"workspace",temperature:0.2,maxOutputTokens:2000} as const;
