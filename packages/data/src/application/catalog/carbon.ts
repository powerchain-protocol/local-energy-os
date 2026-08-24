import type{CarbonCredit,CarbonDashboard,CarbonProject}from"@/types/carbon";
export const carbonDashboard:CarbonDashboard={creditsIssued:128420,creditsTraded:76310,creditsRetired:38450,co2Reduced:128420,esgScore:91,portfolioValue:1842000};
export const carbonProjects:CarbonProject[]=[
{id:"carb-prj-001",name:"Nordic Solar Portfolio",type:"solar",country:"Finland",standard:"Verra VCS",verifiedTonnes:28400,status:"operational",owner:"PowerChain Energy Oy"},
{id:"carb-prj-002",name:"Baltic Offshore Wind",type:"wind",country:"Estonia",standard:"Gold Standard",verifiedTonnes:46200,status:"verification",owner:"Baltic Wind Cooperative"},
{id:"carb-prj-003",name:"Community Battery Flex",type:"battery",country:"Germany",standard:"ISO 14064",verifiedTonnes:9800,status:"operational",owner:"GridFlex GmbH"},
{id:"carb-prj-004",name:"Blue Carbon Coast",type:"blue_carbon",country:"Portugal",standard:"Verra VCS",verifiedTonnes:17600,status:"development",owner:"Atlantic Nature Fund"}];
export const carbonCredits:CarbonCredit[]=[
{id:"CRT-2026-10021",projectId:"carb-prj-001",vintage:2026,tonnes:2500,price:31.4,currency:"EUR",status:"listed",blockchainHash:"5Qx...7mA"},
{id:"CRT-2026-10022",projectId:"carb-prj-002",vintage:2026,tonnes:4200,price:29.8,currency:"EUR",status:"verified"},
{id:"CRT-2025-09418",projectId:"carb-prj-003",vintage:2025,tonnes:900,price:34.1,currency:"USDC",status:"retired",blockchainHash:"9Br...2Pk"}];
export const issuanceSeries=[{month:"Feb",issued:8200,retired:2600},{month:"Mar",issued:10400,retired:3100},{month:"Apr",issued:12800,retired:3900},{month:"May",issued:15100,retired:4700},{month:"Jun",issued:17400,retired:5200},{month:"Jul",issued:19200,retired:6100}];
