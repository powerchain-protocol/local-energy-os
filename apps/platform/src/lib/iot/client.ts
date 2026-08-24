export type IoTReading={deviceId:string;metric:string;value:number;unit:string;timestamp:string;quality:"good"|"estimated"|"stale"};
export async function fetchIoTReadings(endpoint:string, signal?:AbortSignal):Promise<IoTReading[]>{
 const response=await fetch(endpoint,{signal,headers:{accept:"application/json"}}); if(!response.ok) throw new Error(`IoT endpoint returned ${response.status}`); const body=await response.json(); return Array.isArray(body)?body:body.readings??[];
}
