export const TOKEN_2022_PROGRAM_ID = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";
export interface Token2022MetadataConfig { name:string; symbol:string; uri:string; decimals:number; mintAuthority:string; updateAuthority:string; metadataPointer?:boolean; transferFeeBasisPoints?:number; }
export function validateToken2022Metadata(input:Token2022MetadataConfig){
 if(!input.name.trim()||input.name.length>32) throw new Error("Token name must be 1-32 characters");
 if(!/^[A-Z0-9]{2,10}$/.test(input.symbol)) throw new Error("Token symbol must be 2-10 uppercase characters");
 if(!/^https:\/\//.test(input.uri)) throw new Error("Metadata URI must use HTTPS");
 if(!Number.isInteger(input.decimals)||input.decimals<0||input.decimals>18) throw new Error("Decimals must be an integer between 0 and 18");
 if(input.transferFeeBasisPoints!=null&&(input.transferFeeBasisPoints<0||input.transferFeeBasisPoints>10000)) throw new Error("Transfer fee must be 0-10000 basis points");
 return {...input,programId:TOKEN_2022_PROGRAM_ID};
}
export const POWERCHAIN_TOKEN_2022_PROFILES = {
 PWRC:{name:"PowerChain",symbol:"PWRC",decimals:9,metadataPointer:true},
 REC:{name:"PowerChain Renewable Certificate",symbol:"REC",decimals:0,metadataPointer:true},
 CRT:{name:"PowerChain Carbon Credit",symbol:"CRT",decimals:6,metadataPointer:true}
} as const;
