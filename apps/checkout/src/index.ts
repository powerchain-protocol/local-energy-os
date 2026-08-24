import { ApplicationError, createApplication, json, readJson } from "@powerchain/application-runtime";
import { CheckoutError, createCheckoutService, type CreateCheckoutInput } from "@powerchain/checkout";

export const applicationName = "checkout" as const;
export const checkoutService = createCheckoutService();

function checkoutFailure(error: unknown): never {
  if (error instanceof CheckoutError) throw new ApplicationError(error.code, error.message, error.code.endsWith("NOT_FOUND") ? 404 : 409);
  throw error;
}

export const application = createApplication({
  manifest: {
    id: applicationName,
    name: "PowerChain Checkout",
    version: "1.0.0",
    description: "Non-custodial multi-asset checkout lifecycle and settlement boundary.",
    basePath: "/api/v1/checkout",
    capabilities: ["sessions", "pricing", "wallet-approval", "settlement"],
  },
  routes: [
    { method: "POST", path: "/api/v1/checkout/sessions", summary: "Create a checkout session", async handler(request) { try { return json(checkoutService.create(await readJson<CreateCheckoutInput>(request)), { status: 201 }); } catch (error) { return checkoutFailure(error); } } },
    { method: "GET", path: "/api/v1/checkout/sessions/:id", summary: "Read a checkout session", handler(_request, { params }) { try { return json(checkoutService.get(params.id)); } catch (error) { return checkoutFailure(error); } } },
    { method: "POST", path: "/api/v1/checkout/sessions/:id/review", summary: "Lock the review state", handler(_request, { params }) { try { return json(checkoutService.review(params.id)); } catch (error) { return checkoutFailure(error); } } },
    { method: "POST", path: "/api/v1/checkout/sessions/:id/signature-request", summary: "Request wallet approval", async handler(request, { params }) { const body = await readJson<{ payerWallet?: string }>(request); try { return json(checkoutService.requestSignature(params.id, body.payerWallet ?? "")); } catch (error) { return checkoutFailure(error); } } },
    { method: "POST", path: "/api/v1/checkout/sessions/:id/submit", summary: "Record a wallet-submitted transaction", async handler(request, { params }) { const body = await readJson<{ signature?: string }>(request); try { return json(checkoutService.submit(params.id, body.signature ?? "")); } catch (error) { return checkoutFailure(error); } } },
    { method: "POST", path: "/api/v1/checkout/sessions/:id/confirm", summary: "Confirm verified settlement", async handler(request, { params }) { const body = await readJson<{ signature?: string }>(request); try { return json(checkoutService.confirm(params.id, body.signature ?? "")); } catch (error) { return checkoutFailure(error); } } },
    { method: "POST", path: "/api/v1/checkout/sessions/:id/cancel", summary: "Cancel an open session", handler(_request, { params }) { try { return json(checkoutService.cancel(params.id)); } catch (error) { return checkoutFailure(error); } } },
  ],
});
