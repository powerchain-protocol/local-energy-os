import{digitalTwins}from"@/data/digital-twins";
export function listDigitalTwins(){return digitalTwins}
export function getDigitalTwin(id:string){return digitalTwins.find(t=>t.id===id||t.assetId===id)}
export function calculateTwinPortfolio(){return digitalTwins.reduce((a,t)=>({capacityKw:a.capacityKw+t.capacityKw,currentOutputKw:a.currentOutputKw+t.currentOutputKw,carbonAvoidedKg:a.carbonAvoidedKg+t.carbonAvoidedKg,tokenizedEnergyKwh:a.tokenizedEnergyKwh+t.tokenizedEnergyKwh}),{capacityKw:0,currentOutputKw:0,carbonAvoidedKg:0,tokenizedEnergyKwh:0})}
