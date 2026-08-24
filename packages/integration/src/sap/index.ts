import type {
  IntegrationContext,
  IntegrationHealth,
  IntegrationResult,
} from "../core";
import { unavailable } from "../core";
export interface CreateEnergyOrder {
  operationId: string;
  organizationId: string;
  quantityKwh: string;
  currency: string;
}
export interface SettlementPosting {
  operationId: string;
  settlementId: string;
  amount: string;
  currency: string;
}
export interface Order {
  id: string;
  status: string;
}
export interface Posting {
  id: string;
  status: string;
}
export interface BusinessPartner {
  id: string;
  name: string;
}
export class SapAdapter {
  readonly provider = "sap";
  constructor(private readonly configured = false) {}
  private fail<T>(): IntegrationResult<T> {
    return unavailable(
      this.provider,
      "INVALID_CONFIGURATION",
      "SAP credentials or endpoint are not configured",
    );
  }
  async createEnergyOrder(
    _input: CreateEnergyOrder,
    _context?: IntegrationContext,
  ) {
    return this.fail<Order>();
  }
  async postSettlement(
    _input: SettlementPosting,
    _context?: IntegrationContext,
  ) {
    return this.fail<Posting>();
  }
  async getBusinessPartner(_id: string, _context?: IntegrationContext) {
    return this.fail<BusinessPartner>();
  }
  async health(): Promise<IntegrationHealth> {
    return {
      provider: this.provider,
      state: this.configured ? "unavailable" : "misconfigured",
      checkedAt: new Date().toISOString(),
      errorCode: this.configured
        ? "PROVIDER_UNAVAILABLE"
        : "INVALID_CONFIGURATION",
    };
  }
}
