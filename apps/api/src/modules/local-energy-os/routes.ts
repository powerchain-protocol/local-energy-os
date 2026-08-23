import { envelope } from "@powerchain/local-energy-api";
import { validateRuntimeConfiguration } from "@powerchain/system-management";
import { resolveEntitlement } from "@powerchain/saas";
import { localEnergyService } from "./service.js";
import { resolveRequestContext } from "./context.js";
import { LOCAL_ENERGY_PLANS, LOCAL_ENERGY_SUBSCRIPTIONS } from "./saas.js";
import { energyBatchFromDto, energyOrderFromDto, energyPositionFromDto, gridConstraintFromDto } from "./dto.js";

export interface RouteRegistrar {
  get(path: string, handler: (request: any, reply?: any) => unknown): unknown;
  post(path: string, handler: (request: any, reply?: any) => unknown): unknown;
}

function rid(request: any) { return resolveRequestContext(request).requestId; }

export function registerLocalEnergyRoutes(app: RouteRegistrar) {
  app.get("/api/v1/energy-batches/:id", (request: any) => {
    const batch = localEnergyService.batches.get(String(request.params.id));
    if (!batch) throw new Error("Energy batch not found");
    return envelope(batch, rid(request));
  });
  app.post("/api/v1/energy-batches", (request: any) => envelope(localEnergyService.putBatch(energyBatchFromDto(request.body)), rid(request)));
  app.post("/api/v1/energy-positions", (request: any) => envelope(localEnergyService.putPosition(energyPositionFromDto(request.body)), rid(request)));
  app.post("/api/v1/energy-orders", (request: any) => envelope(localEnergyService.createOrder(energyOrderFromDto(request.body)), rid(request)));
  app.post("/api/v1/energy-orders/match", (request: any) => {
    const { sellerOrderId, buyerOrderId, constraint } = request.body;
    return envelope(localEnergyService.match(String(sellerOrderId), String(buyerOrderId), gridConstraintFromDto(constraint)), rid(request));
  });

  app.get("/api/v1/pwrc/bridge/config", (request: any) => envelope({ source: "SOLANA", sourceAsset: "PWRC", destination: "SUI", destinationAsset: "wPWRC", backingRatio: "1:1", energyAsset: false }, rid(request)));

  app.get("/api/v1/saas/apps", (request: any) => envelope([
    "energy", "platform", "companies", "grid", "plants", "wind", "ev", "charging", "mapper", "supply-chain"
  ], rid(request)));

  app.get("/api/v1/saas/tenant/:organizationId", (request: any) => envelope({ organizationId: String(request.params.organizationId), tenantId: resolveRequestContext(request).tenantId ?? null }, rid(request)));

  app.post("/api/v1/saas/entitlements/resolve", (request: any) => envelope(resolveEntitlement({
    context: request.body,
    plans: LOCAL_ENERGY_PLANS,
    subscriptions: LOCAL_ENERGY_SUBSCRIPTIONS,
  }), rid(request)));

  app.post("/api/v1/system/runtime/validate", (request: any) => envelope(validateRuntimeConfiguration(request.body), rid(request)));

  app.get("/api/v1/system/local-energy-os", (request: any) => envelope({
    product: "PowerChain Local Energy OS",
    version: "1.0.0",
    canonicalEnergyUnit: "Wh",
    pwrcNetwork: "SOLANA",
    wpwrcNetwork: "SUI",
    physicalEnergyAuthoritative: true,
  }, rid(request)));
}
