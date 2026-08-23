import { parseBigIntField } from "@powerchain/local-energy-api";

function date(value: unknown, field: string): Date {
  const parsed = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(parsed.valueOf())) throw new TypeError(`${field} must be an ISO date`);
  return parsed;
}

export function energyBatchFromDto(body: any) {
  return {
    ...body,
    measuredWh: parseBigIntField(body.measuredWh, "measuredWh"),
    verifiedWh: parseBigIntField(body.verifiedWh, "verifiedWh"),
    reservedWh: parseBigIntField(body.reservedWh ?? "0", "reservedWh"),
    representedWh: parseBigIntField(body.representedWh ?? "0", "representedWh"),
    retiredWh: parseBigIntField(body.retiredWh ?? "0", "retiredWh"),
    invalidatedWh: parseBigIntField(body.invalidatedWh ?? "0", "invalidatedWh"),
    intervalStart: date(body.intervalStart, "intervalStart"),
    intervalEnd: date(body.intervalEnd, "intervalEnd"),
  };
}

export function energyPositionFromDto(body: any) {
  return {
    ...body,
    amountWh: parseBigIntField(body.amountWh, "amountWh"),
    intervalStart: date(body.intervalStart, "intervalStart"),
    intervalEnd: date(body.intervalEnd, "intervalEnd"),
  };
}

export function energyOrderFromDto(body: any) {
  const amountWh = parseBigIntField(body.amountWh, "amountWh");
  return {
    ...body,
    amountWh,
    remainingWh: parseBigIntField(body.remainingWh ?? amountWh, "remainingWh"),
    priceMinorPerKwh: parseBigIntField(body.priceMinorPerKwh, "priceMinorPerKwh"),
  };
}

export function gridConstraintFromDto(body: any) {
  return {
    ...body,
    maxTransferWh: parseBigIntField(body.maxTransferWh, "maxTransferWh"),
  };
}


export function energyRwaFromDto(body: any) {
  return {
    id: String(body.id), tenantId: String(body.tenantId), organizationId: String(body.organizationId),
    ...(body.companyId ? { companyId: String(body.companyId) } : {}), positionId: String(body.positionId),
    denomination: body.denomination === "MWh" ? "MWh" as const : "kWh" as const,
    provenance: body.provenance ?? {},
  };
}
export function chainRepresentationFromDto(body:any){return{energyPositionId:String(body.energyPositionId),network:body.network==="SUI"?"SUI" as const:"SOLANA" as const,reference:String(body.reference),amountWh:parseBigIntField(body.amountWh,"amountWh"),state:body.state??"ACTIVE",...(body.explorerUrl?{explorerUrl:String(body.explorerUrl)}:{})};}
