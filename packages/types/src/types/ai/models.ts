export type AIModelKind = "llm" | "lora" | "mpc";
export type AIModel = { id:string; name:string; provider:string; kind:AIModelKind; contextWindow:number; capabilities:string[]; status:"available"|"degraded"|"offline" };
export const aiModels: AIModel[] = [
 {id:"powerchain-renewables",name:"PowerChain Renewables",provider:"PowerChain",kind:"lora",contextWindow:32768,capabilities:["forecasting","maintenance","market analysis"],status:"available"},
 {id:"powerchain-secure-mpc",name:"PowerChain Secure MPC",provider:"PowerChain",kind:"mpc",contextWindow:16384,capabilities:["private portfolio analysis","multi-party optimization"],status:"available"},
 {id:"general-llm",name:"General Operations LLM",provider:"Configured provider",kind:"llm",contextWindow:128000,capabilities:["chat","summarization","tool use"],status:"available"}
];
