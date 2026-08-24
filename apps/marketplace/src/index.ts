import { ApplicationError, createApplication, json, readJson } from "@powerchain/application-runtime";
import { createMarketplaceService, MarketplaceError, type MarketplaceListing } from "@powerchain/marketplace";

export const applicationName = "marketplace" as const;
export const marketplaceService = createMarketplaceService();

function marketplaceFailure(error: unknown): never {
  if (error instanceof MarketplaceError) throw new ApplicationError(error.code, error.message, error.code.endsWith("NOT_FOUND") ? 404 : 409);
  throw error;
}

export const application = createApplication({
  manifest: {
    id: applicationName,
    name: "PowerChain Marketplace",
    version: "1.0.0",
    description: "Inventory, listing, reservation, checkout, and order lifecycle service.",
    basePath: "/api/v1/marketplace",
    capabilities: ["listings", "inventory", "orders", "checkout-linking"],
  },
  routes: [
    { method: "GET", path: "/api/v1/marketplace/listings", summary: "Search active listings", handler(request) { return json({ data: marketplaceService.list(new URL(request.url).searchParams.get("q") ?? "") }); } },
    { method: "POST", path: "/api/v1/marketplace/listings", summary: "Create a draft listing", async handler(request) { try { return json(marketplaceService.createListing(await readJson<Omit<MarketplaceListing, "id" | "remaining" | "status" | "createdAt" | "updatedAt">>(request)), { status: 201 }); } catch (error) { return marketplaceFailure(error); } } },
    { method: "GET", path: "/api/v1/marketplace/listings/:id", summary: "Read a listing", handler(_request, { params }) { try { return json(marketplaceService.getListing(params.id)); } catch (error) { return marketplaceFailure(error); } } },
    { method: "POST", path: "/api/v1/marketplace/listings/:id/activate", summary: "Publish a listing", handler(_request, { params }) { try { return json(marketplaceService.activate(params.id)); } catch (error) { return marketplaceFailure(error); } } },
    { method: "POST", path: "/api/v1/marketplace/listings/:id/orders", summary: "Reserve inventory", async handler(request, { params }) { const body = await readJson<{ buyerId?: string; quantity?: number }>(request); try { return json(marketplaceService.reserve(params.id, body.buyerId ?? "", body.quantity ?? 0), { status: 201 }); } catch (error) { return marketplaceFailure(error); } } },
    { method: "GET", path: "/api/v1/marketplace/orders/:id", summary: "Read an order", handler(_request, { params }) { try { return json(marketplaceService.getOrder(params.id)); } catch (error) { return marketplaceFailure(error); } } },
    { method: "POST", path: "/api/v1/marketplace/orders/:id/checkout", summary: "Attach checkout to a reservation", async handler(request, { params }) { const body = await readJson<{ checkoutSessionId?: string }>(request); try { return json(marketplaceService.attachCheckout(params.id, body.checkoutSessionId ?? "")); } catch (error) { return marketplaceFailure(error); } } },
    { method: "POST", path: "/api/v1/marketplace/orders/:id/paid", summary: "Confirm paid checkout", async handler(request, { params }) { const body = await readJson<{ checkoutSessionId?: string }>(request); try { return json(marketplaceService.markPaid(params.id, body.checkoutSessionId ?? "")); } catch (error) { return marketplaceFailure(error); } } },
  ],
});
