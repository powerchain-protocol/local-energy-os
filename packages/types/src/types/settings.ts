import type { SolanaCluster } from "@/config/networks";
export type AiProvider="openai"|"anthropic"|"google"|"azure"|"ollama"|"custom";
export interface UserIntegrationSettings {
 cluster:SolanaCluster; customRpcUrl:string; heliusApiKey:string; heliusRpcUrl:string;
 aiProvider:AiProvider; aiModel:string; aiBaseUrl:string; aiApiKey:string;
 walletAddress:string; updatedAt:string;
}
export const DEFAULT_USER_SETTINGS:UserIntegrationSettings={cluster:"devnet",customRpcUrl:"",heliusApiKey:"",heliusRpcUrl:"",aiProvider:"openai",aiModel:"gpt-4.1-mini",aiBaseUrl:"",aiApiKey:"",walletAddress:"",updatedAt:""};
