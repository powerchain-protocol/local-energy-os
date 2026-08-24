import type { CopilotPromptDefinition } from "../types";

export const COPILOT_PROMPTS: readonly CopilotPromptDefinition[] = [
  { id:"asset-performance", category:"ASSETS", title:"Analyze asset performance", prompt:"Analyze this asset's performance and explain material deviations.", mode:"ANALYZE", contexts:["ASSET","DIGITAL_TWIN"] },
  { id:"forecast-compare", category:"ASSETS", title:"Compare against forecast", prompt:"Compare current production against the relevant forecast and explain deviations greater than 5%.", mode:"ANALYZE", contexts:["ASSET","PORTFOLIO"] },
  { id:"asset-risk", category:"RISK", title:"Run risk review", prompt:"Run a risk review and classify findings as INFORMATION, WATCH, ATTENTION, or CRITICAL.", mode:"ANALYZE", contexts:["ASSET","PROJECT","ENERGY_RWA"] },
  { id:"missing-documents", category:"RISK", title:"Find missing documents", prompt:"Review available documentation and identify missing information or verification gaps.", mode:"ANALYZE", contexts:["DOCUMENT","PROJECT","ENERGY_RWA"] },
  { id:"funding-progress", category:"CAPITAL", title:"Analyze funding progress", prompt:"Analyze funding progress, allocation status and funding velocity.", mode:"ANALYZE", contexts:["FUNDING_ROUND","PROJECT"] },
  { id:"treasury-review", category:"CAPITAL", title:"Explain treasury activity", prompt:"Explain recent treasury and settlement activity and flag unusual movements.", mode:"ANALYZE", contexts:["TREASURY","TRANSACTION"] },
  { id:"weekly-review", category:"OPERATIONS", title:"Prepare weekly review", prompt:"Prepare a weekly operating review with findings, risks and recommended operator actions.", mode:"ACT", contexts:["ASSET","PORTFOLIO","PROJECT"] },
  { id:"monthly-report", category:"OPERATIONS", title:"Generate monthly report", prompt:"Prepare the monthly performance report as a reviewable draft with evidence references.", mode:"ACT", contexts:["ASSET","PORTFOLIO","REPORT"] },
] as const;
