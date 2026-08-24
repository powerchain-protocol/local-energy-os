export interface AiConfigurationSummaryProps{model:string;provider:string;memory:string;estimatedPwrc:string}
export function formatAiConfigurationSummary(input:AiConfigurationSummaryProps){return`${input.model} • ${input.provider} • ${input.memory} • ${input.estimatedPwrc} PWRC/message`}
