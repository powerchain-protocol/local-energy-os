import type { CopilotContextRef, CopilotContextType } from "../types";

export function contextSuggestions(type: CopilotContextType): readonly string[] {
  switch(type){
    case "ASSET":
    case "DIGITAL_TWIN":
      return ["Analyze production","Explain asset health","Compare with forecast","Check for risks","Generate asset report"];
    case "TREASURY":
    case "TRANSACTION":
      return ["Explain today's settlement activity","Reconcile treasury movements","Find unusual transactions","Prepare treasury report"];
    case "FUNDING_ROUND":
      return ["Analyze funding velocity","Review allocation status","Identify participation anomalies","Prepare launch update"];
    case "DOCUMENT":
      return ["Summarize documents","Find missing information","Check verification status","Create due diligence checklist"];
    case "LOCAL_ENERGY":
      return ["Explain local energy balance","Analyze local market activity","Check grid flexibility","Review meter delivery","Prepare community energy report"];
    case "ENERGY_RWA":
      return ["Verify Energy RWA backing","Review Solana/Sui representation coverage","Check retirement readiness","Generate RWA verification report"];
    case "PORTFOLIO":
      return ["Compare portfolio performance","Find underperforming assets","Review concentration risk","Prepare portfolio report"];
    default:
      return ["Review Digital Energy operations","Analyze Renewable RWA portfolio","Check current risks","Prepare weekly operating review"];
  }
}

export function contextMention(type: CopilotContextType): string {
  return `@${type.split("_").map(part=>part[0]+part.slice(1).toLowerCase()).join("")}`;
}

export function normalizeContexts(contexts: readonly CopilotContextRef[] = []): CopilotContextRef[] {
  const seen = new Set<string>();
  return contexts.filter(item => {
    const key = `${item.type}:${item.id}`;
    if (!item.id.trim() || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 12);
}
