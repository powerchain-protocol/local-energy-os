import test from "node:test";
import assert from "node:assert/strict";
import { createApplication, json } from "../../application-runtime/src/index.ts";
import { calculateCheckoutTotals, createCheckoutService } from "../../checkout/src/service.ts";
import { createMarketplaceService } from "../../marketplace/src/service.ts";

test("application runtime exposes health, metadata, request IDs and route parameters", async () => {
  const app = createApplication({
    manifest: { id: "test", name: "Test", version: "1.0.0", description: "test", basePath: "/api/v1", capabilities: ["test"] },
    routes: [{ method: "GET", path: "/api/v1/items/:id", summary: "Read item", handler: (_request, context) => json({ id: context.params.id }) }],
  });
  const live = await app.fetch(new Request("http://localhost/health/live"));
  assert.equal(live.status, 200);
  assert.ok(live.headers.get("x-request-id"));
  const item = await app.fetch(new Request("http://localhost/api/v1/items/item-1", { headers: { "x-request-id": "request-1" } }));
  assert.deepEqual(await item.json(), { id: "item-1" });
  assert.equal(item.headers.get("x-request-id"), "request-1");
  const missing = await app.fetch(new Request("http://localhost/missing"));
  assert.equal(missing.status, 404);
});

test("checkout lifecycle uses exact integer pricing and wallet-controlled settlement", () => {
  assert.deepEqual(calculateCheckoutTotals([{ id: "energy", name: "Energy credit", quantity: 2, unitAmountMinor: "100" }]), { subtotalMinor: "200", serviceFeeMinor: "5", networkFeeMinor: null, totalMinor: "205" });
  const checkout = createCheckoutService();
  const created = checkout.create({ currency: "USDC", lines: [{ id: "energy", name: "Energy credit", quantity: 2, unitAmountMinor: "100" }] });
  assert.equal(checkout.review(created.id).status, "review");
  assert.equal(checkout.requestSignature(created.id, "wallet-address").status, "pending_signature");
  const signature = "signature_12345678901234567890123456789012";
  assert.equal(checkout.submit(created.id, signature).status, "submitted");
  assert.equal(checkout.confirm(created.id, signature).status, "confirmed");
});

test("marketplace reservation links inventory, order and checkout state", () => {
  const marketplace = createMarketplaceService();
  const draft = marketplace.createListing({ sellerId: "seller-1", title: "Solar generation credit", description: "Verified renewable production", currency: "USDC", unitAmountMinor: "250", inventory: 4 });
  marketplace.activate(draft.id);
  const order = marketplace.reserve(draft.id, "buyer-1", 2);
  assert.equal(order.amountMinor, "500");
  assert.equal(marketplace.getListing(draft.id).remaining, 2);
  assert.equal(marketplace.attachCheckout(order.id, "chk_1").status, "checkout_pending");
  assert.equal(marketplace.markPaid(order.id, "chk_1").status, "paid");
});

test("all service apps expose deployable runtime entry points", async () => {
  const apps = ["ai-gateway", "api", "checkout", "explorer", "integration-gateway", "marketplace", "web", "websocket-gateway", "workers"];
  const fs = await import("node:fs");
  for (const app of apps) {
    assert.ok(fs.existsSync(`apps/${app}/src/server.ts`), app);
    const manifest = JSON.parse(fs.readFileSync(`apps/${app}/package.json`, "utf8"));
    assert.ok(manifest.scripts.start, `${app} start`);
    assert.ok(manifest.scripts.dev, `${app} dev`);
    assert.equal(manifest.dependencies["@powerchain/application-runtime"], "workspace:*");
  }
});
