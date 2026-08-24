import type { CopilotAgentDefinition } from "../types";

export const COPILOT_AGENTS: readonly CopilotAgentDefinition[] = [
  {
    id:"asset-researcher", name:"Asset Researcher", purpose:"Research renewable markets, technologies, regions, projects, policy and external conditions.",
    skills:["market-research"], permissions:["READ","ANALYZE"],
    outputContract:["KEY FINDING","SUPPORTING EVIDENCE","WHY IT MATTERS","SOURCE","CONFIDENCE"],
  },
  {
    id:"asset-analyst", name:"Asset Analyst", purpose:"Understand renewable asset and energy performance.",
    skills:["asset-analysis","forecast-analysis","anomaly-detection"], permissions:["READ","ANALYZE","RECOMMEND"],
    outputContract:["FINDING","FACTORS","DATA CONFIDENCE","RECOMMENDED ACTION"],
  },
  {
    id:"risk-agent", name:"Risk Agent", purpose:"Find operational, data, documentation, treasury and configuration risk signals.",
    skills:["anomaly-detection","rwa-verification","document-analysis"], permissions:["READ","ANALYZE","RECOMMEND"],
    outputContract:["SEVERITY","WHAT HAPPENED","WHY IT MATTERS","EVIDENCE","CONFIDENCE","RECOMMENDED NEXT ACTION"],
  },
  {
    id:"capital-agent", name:"Capital Agent", purpose:"Track funding, treasury, settlement, distribution and revenue lifecycle.",
    skills:["funding-analysis","treasury-analysis"], permissions:["READ","ANALYZE","RECOMMEND"],
    outputContract:["CAPITAL STATUS","PROGRESS","VELOCITY","ATTENTION REQUIRED","RECOMMENDED ACTION"],
  },
  {
    id:"operator-agent", name:"Operator Agent", purpose:"Turn intelligence into reviewable work without silently executing high-impact actions.",
    skills:["workflow-planning","report-generation"], permissions:["READ","ANALYZE","DRAFT","RECOMMEND","REQUEST_APPROVAL"],
    outputContract:["FINDING","OPERATOR ACTION","OWNER","DUE","APPROVAL REQUIRED"],
  },
  {
    id:"verification-agent", name:"Verification Agent", purpose:"Verify asset records, data consistency, document completeness, source integrity and on-chain references.",
    skills:["rwa-verification","document-analysis"], permissions:["READ","ANALYZE","RECOMMEND"],
    outputContract:["VERIFICATION STATUS","EVIDENCE","CONFLICTS","MISSING DATA","NEXT ACTION"],
  },
  {
    id:"document-intelligence-agent", name:"Document Intelligence Agent", purpose:"Summarize and compare renewable RWA documents and identify missing information.",
    skills:["document-analysis"], permissions:["READ","ANALYZE"],
    outputContract:["SUMMARY","KEY TERMS","INCONSISTENCIES","MISSING INFORMATION"],
  },
  {
    id:"reporting-agent", name:"Reporting Agent", purpose:"Generate reviewable asset, portfolio, treasury, funding and impact reports.",
    skills:["report-generation"], permissions:["READ","ANALYZE","DRAFT","REQUEST_APPROVAL"],
    outputContract:["REPORT DRAFT","EVIDENCE REFERENCES","ASSUMPTIONS","REVIEW REQUIRED"],
  },
  {
    id:"impact-agent", name:"Impact Agent", purpose:"Analyze asset and portfolio energy-impact data under explicit methodologies.",
    skills:["impact-calculation","asset-analysis"], permissions:["READ","ANALYZE"],
    outputContract:["METHODOLOGY","ENERGY METRICS","IMPACT METRICS","ASSUMPTIONS","CONFIDENCE"],
  },
  {
    id:"launch-agent", name:"Launch Agent", purpose:"Prepare launch configuration, readiness checks, allocations, participation monitoring and launch reports.",
    skills:["funding-analysis","rwa-verification","report-generation"], permissions:["READ","ANALYZE","DRAFT","RECOMMEND","REQUEST_APPROVAL"],
    outputContract:["READINESS","CONFIGURATION CHECK","ALLOCATION STATUS","RISKS","REVIEW REQUIRED"],
  },
] as const;
