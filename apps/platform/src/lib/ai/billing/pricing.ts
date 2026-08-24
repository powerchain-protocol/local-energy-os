import{createUsageQuote,quotePwrc}from"@powerchain/credits";
export const DEFAULT_AI_MESSAGE_USD="0.002";
export const INITIAL_PWRC_USD="0.000002";
export function getDefaultAiQuote(){return createUsageQuote({estimatedUsd:DEFAULT_AI_MESSAGE_USD,pwrcUsdPrice:INITIAL_PWRC_USD})}
export function calculatePwrcCharge(usdCharge:string,pwrcUsdPrice:string){return quotePwrc(usdCharge,pwrcUsdPrice).toString()}
