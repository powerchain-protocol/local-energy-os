const SENSITIVE_KEYS=["apiKey","heliusApiKey","aiApiKey","privateKey","secret"];
export function redactSecrets<T extends Record<string,unknown>>(value:T):T {
 const copy:Record<string,unknown>={...value}; for(const key of Object.keys(copy)){if(SENSITIVE_KEYS.some(s=>key.toLowerCase().includes(s.toLowerCase()))&&copy[key]) copy[key]="••••••••";} return copy as T;
}
export function isSecureEndpoint(value:string):boolean {try{return new URL(value).protocol==="https:";}catch{return false;}}
