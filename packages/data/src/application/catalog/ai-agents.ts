import type{PowerChainAgent}from"@/types/ai/agents";
export const POWERCHAIN_AGENTS:PowerChainAgent[]=[
{id:"renewable-forecast",name:"Renewable Forecast Agent",domain:"renewables",description:"Forecasts generation and weather-adjusted renewable output.",skills:["forecast-generation","weather-correlation","capacity-analysis"],modelId:"gridllm-energy",requiresApproval:false},
{id:"grid-optimizer",name:"Grid Optimization Agent",domain:"grid",description:"Evaluates congestion, flexibility and dispatch options.",skills:["grid-balance","demand-response","battery-dispatch"],modelId:"gridllm-energy",requiresApproval:true},
{id:"tokenomics-analyst",name:"Tokenomics Analyst",domain:"tokenomics",description:"Analyzes PWRC, wPWRC, CRT, fees, supply and market assumptions.",skills:["token-pricing","supply-analysis","bridge-invariant"],modelId:"tokenomics-lora",requiresApproval:false},
{id:"carbon-intelligence",name:"Carbon Intelligence Agent",domain:"carbon",description:"Evaluates carbon credits, REC issuance and ESG outcomes.",skills:["carbon-accounting","credit-pricing","retirement-analysis"],modelId:"gridllm-energy",requiresApproval:false},
{id:"maintenance",name:"Predictive Maintenance Agent",domain:"maintenance",description:"Detects asset anomalies and recommends maintenance actions.",skills:["anomaly-detection","health-scoring","maintenance-planning"],modelId:"renewables-lora",requiresApproval:true},
{id:"market-intelligence",name:"Market Intelligence Agent",domain:"market",description:"Supports energy pricing, matching and settlement decisions.",skills:["dynamic-pricing","order-matching","risk-scoring"],modelId:"gridllm-energy",requiresApproval:true},
];
