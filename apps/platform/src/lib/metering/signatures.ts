export function hasPlausibleDeviceSignature(signature:string){return /^[A-Za-z0-9+/=_-]{16,}$/.test(signature)}
