import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read=(path)=>fs.readFileSync(path,"utf8");

test("Local Energy marketplace surfaces metering, reconciliation and controlled settlement",()=>{
  const ui=read("apps/platform/src/workspaces/p2p/components/p2p-marketplace.tsx");
  assert.match(ui,/Reservation reserve/);
  assert.match(ui,/Smart meter/);
  assert.match(ui,/My energy activity/);
  assert.match(ui,/Meter evidence before settlement/);
  assert.match(ui,/Reconcile/);
  assert.match(ui,/Idempotency-Key/);
});

test("P2P compatibility APIs use the canonical tenant-aware Local Energy lifecycle",()=>{
  assert.equal(fs.existsSync("apps/platform/src/app/api/v1/p2p/community/route.ts"),true);
  assert.equal(fs.existsSync("apps/platform/src/app/api/v1/p2p/orders/[id]/route.ts"),true);
  const create=read("apps/platform/src/app/api/v1/p2p/orders/route.ts");
  const update=read("apps/platform/src/app/api/v1/p2p/orders/[id]/route.ts");
  assert.match(create,/isSolanaAddress/);
  assert.match(create,/requireLocalEnergyIdempotencyKey/);
  assert.match(update,/RECORD_DELIVERY/);
  assert.match(update,/RECONCILE/);
  assert.match(update,/MARK_SETTLEMENT_READY/);
  assert.match(update,/MARK_SETTLED/);
});
