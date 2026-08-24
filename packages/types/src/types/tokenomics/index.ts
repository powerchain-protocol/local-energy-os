export type TokenNetwork="solana"|"sui"|"cross-chain";
export type TokenDetail={symbol:string;name:string;purpose:string;network:TokenNetwork;decimals:number;initialPriceUsd:number;utility:string[];supply:string;contractLabel:string;accent:"green"|"teal"|"blue"};
