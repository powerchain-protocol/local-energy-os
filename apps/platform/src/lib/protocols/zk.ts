export type ZkProofState="pending"|"verified"|"rejected";
export type RenewableZkClaim={claimId:string;assetId:string;meterId:string;periodStart:string;periodEnd:string;verifiedWh:string;commitment:string;proofSystem:"groth16"|"plonk"|"stark";state:ZkProofState};
export function validateRenewableClaim(claim:RenewableZkClaim){if(BigInt(claim.verifiedWh)<=0n)throw new Error("Verified energy must be positive");if(!/^0x[a-fA-F0-9]{64}$/.test(claim.commitment))throw new Error("Invalid proof commitment");return claim;}
