import type{CarbonCredit,CarbonProject}from"@/types/carbon";
export function calculateAvoidedEmissions(mwh:number,factorKgPerKwh:number){if(mwh<0||factorKgPerKwh<0)throw new Error("Inputs must be non-negative");return Number(((mwh*1000*factorKgPerKwh)/1000).toFixed(3));}
export function canIssueCredit(project:CarbonProject,verifiedTonnes:number){return project.status==="operational"&&verifiedTonnes>0&&verifiedTonnes<=project.verifiedTonnes;}
export function retireCredit(credit:CarbonCredit,tonnes:number){if(credit.status==="retired"||credit.status==="cancelled")throw new Error("Credit is not eligible for retirement");if(tonnes<=0||tonnes>credit.tonnes)throw new Error("Invalid retirement quantity");return{...credit,tonnes:credit.tonnes-tonnes,status:credit.tonnes===tonnes?"retired":credit.status};}
export function portfolioValue(credits:CarbonCredit[]){return credits.filter(c=>!["retired","cancelled"].includes(c.status)).reduce((sum,c)=>sum+c.tonnes*c.price,0);}
