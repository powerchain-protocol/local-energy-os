"use server";import{isPowerChainPrompt,selectAgent}from"@/services/ai/powerchain-ai";
export async function analyzePowerChainPrompt(prompt:string){if(!isPowerChainPrompt(prompt))return{ok:false,error:"Prompt must relate to a PowerChain renewable-energy use case."};const agent=selectAgent(prompt);return{ok:true,agentId:agent.id,requiresApproval:agent.requiresApproval}}
