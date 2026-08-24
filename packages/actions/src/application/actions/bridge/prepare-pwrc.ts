"use server";import{preparePwrcBridgeTransfer}from"@/services/bridge/pwrc-bridge";import type{PwrcBridgeDirection}from"@/types/bridge/pwrc";
export async function preparePwrcTransfer(input:{direction:PwrcBridgeDirection;amount:string;sourceAddress:string;destinationAddress:string}){return preparePwrcBridgeTransfer(input)}
