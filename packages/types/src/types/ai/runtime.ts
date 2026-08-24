export type{AiAgent,AiProviderConnection,AiUsageQuote,AiUsageSettlement,GridLlmConfig,LoraAdapter,MemoryConfig,ModelCapabilities,PromptTemplate}from"@powerchain/ai-core";
export type AiPaymentMode="powerchain-hosted"|"user-api-key"|"hybrid";
export interface ChatUsageDetails{model:string;provider:string;inputTokens:number;outputTokens:number;cachedTokens?:number;toolCalls?:number;costUsd:string;chargedPwrc:string;latencyMs:number}
