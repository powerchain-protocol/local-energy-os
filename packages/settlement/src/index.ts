export type SettlementState = "DELIVERY_PENDING"|"METERING"|"RECONCILING"|"CALCULATED"|"PAYMENT_PENDING"|"PAID"|"RECONCILED"|"DISPUTED"|"FAILED"|"REQUIRES_REVIEW";
const transitions: Record<SettlementState, readonly SettlementState[]> = {
  DELIVERY_PENDING:["METERING","FAILED"], METERING:["RECONCILING","DISPUTED","FAILED"], RECONCILING:["CALCULATED","DISPUTED","REQUIRES_REVIEW"],
  CALCULATED:["PAYMENT_PENDING","REQUIRES_REVIEW"], PAYMENT_PENDING:["PAID","FAILED"], PAID:["RECONCILED","DISPUTED"], RECONCILED:[], DISPUTED:["RECONCILING","FAILED"], FAILED:[], REQUIRES_REVIEW:["RECONCILING","FAILED"]
};
export function canTransitionSettlement(from: SettlementState, to: SettlementState): boolean { return transitions[from].includes(to); }
export function assertSettlementTransition(from: SettlementState, to: SettlementState) { if (!canTransitionSettlement(from,to)) throw new Error(`INVALID_SETTLEMENT_TRANSITION:${from}->${to}`); }
