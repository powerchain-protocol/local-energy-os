export function certificateId(kind:"REC"|"CRT",origin:string,vintage:number,serial:number){return kind+"-"+origin.toUpperCase()+"-"+vintage+"-"+String(serial).padStart(8,"0")}
