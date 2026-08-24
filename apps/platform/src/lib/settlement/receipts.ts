import{randomUUID}from"node:crypto";export function createReceipt(input:Record<string,unknown>){return{receiptId:randomUUID(),issuedAt:new Date().toISOString(),...input}}
