export type SaaSIntegration={id:string;name:string;category:"erp"|"crm"|"payments"|"observability";status:"connected"|"available";description:string};
export const SAAS_INTEGRATIONS:SaaSIntegration[]=[
{id:"sap",name:"SAP S/4HANA",category:"erp",status:"available",description:"Synchronize assets, procurement and finance."},
{id:"salesforce",name:"Salesforce",category:"crm",status:"available",description:"Link customer and partner energy accounts."},
{id:"circle",name:"Circle",category:"payments",status:"connected",description:"USDC settlement and treasury operations."},
{id:"sentry",name:"Sentry",category:"observability",status:"connected",description:"Application performance and error monitoring."}
];
