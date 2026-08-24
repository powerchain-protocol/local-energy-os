import { certificationPrograms, tokenizedCertificates } from "@/data/certification";
import type { CertificateKind, TokenizedCertificate } from "@/types/certification";
import { PowerChainError } from "@/utils/errors";
import { createHash } from "node:crypto";
export function listCertificationPrograms(){ return certificationPrograms; }
export function listCertificates(){ return tokenizedCertificates; }
export function getCertificate(id:string){ return tokenizedCertificates.find(c=>c.id===id); }
export function validateCertificateIssuance(input:{programId:string;kind:CertificateKind;quantity:string;proofHash:string;assetId:string}){
 const program=certificationPrograms.find(p=>p.id===input.programId); if(!program) throw new PowerChainError("Unknown certification program","VALIDATION_ERROR",400);
 if(program.kind!==input.kind) throw new PowerChainError("Certificate kind does not match program","VALIDATION_ERROR",400);
 if(!/^\d+(?:\.\d+)?$/.test(input.quantity)||Number(input.quantity)<=0) throw new PowerChainError("Quantity must be positive","VALIDATION_ERROR",400);
 if(!input.proofHash.trim()) throw new PowerChainError("Proof hash is required","VALIDATION_ERROR",400);
 return program;
}
export function certificateProof(input:unknown){return createHash("sha256").update(JSON.stringify(input)).digest("hex");}
export function canTokenizeCertificate(c:TokenizedCertificate){return ["verified","issued"].includes(c.status)&&Boolean(c.proofHash);}
