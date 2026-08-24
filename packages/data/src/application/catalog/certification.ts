import type { CertificationProgram, TokenizedCertificate } from "@/types/certification";
export const certificationPrograms: CertificationProgram[] = [
 {id:"program-rec",slug:"renewable-energy-certificate",name:"Renewable Energy Certificate",kind:"REC",authority:"PowerChain Certification Council",standard:"PTSP-410",status:"active",jurisdictions:["Global"],validForDays:3650,requirements:["Proof of Energy","Verified meter","No duplicate issuance"]},
 {id:"program-go",slug:"guarantee-of-origin",name:"Guarantee of Origin",kind:"GO",authority:"Authorized regional issuer",standard:"EECS-compatible profile",status:"pilot",jurisdictions:["EEA"],validForDays:365,requirements:["Regional eligibility","Production period","Issuing-body approval"]},
 {id:"program-crt",slug:"carbon-credit-token",name:"Carbon Credit Token",kind:"CRT",authority:"PowerChain Carbon Registry",standard:"PTSP-400",status:"active",jurisdictions:["Global"],validForDays:3650,requirements:["Verified methodology","Independent audit","Retirement controls"]},
 {id:"program-pec",slug:"proof-of-energy-certificate",name:"Proof of Energy Certificate",kind:"PEC",authority:"PowerChain Oracle Network",standard:"PTSP-210",status:"active",jurisdictions:["Global"],validForDays:3650,requirements:["Oracle quorum","Signed measurement","Replay protection"]}
];
export const tokenizedCertificates: TokenizedCertificate[] = [
 {id:"REC-FI-2026-00010421",programId:"program-rec",kind:"REC",ownerId:"org-demo",assetId:"solar-helsinki-01",quantity:"250",unit:"MWh",vintage:2026,status:"issued",issuedAt:"2026-07-28T09:00:00Z",blockchain:"solana",mint:"REC111111111111111111111111111111111111111",metadataUri:"https://powerchain.example/metadata/rec-10421.json",proofHash:"sha256:rec10421"},
 {id:"CRT-BR-2025-00008314",programId:"program-crt",kind:"CRT",ownerId:"org-demo",assetId:"amazon-reforest-44",quantity:"1250",unit:"tCO2e",vintage:2025,status:"verified",issuedAt:"2026-07-15T10:30:00Z",blockchain:"sui",proofHash:"sha256:crt8314"}
];
