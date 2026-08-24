import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("smart-grid modules and routes are present", async()=>{
  const files=["apps/platform/src/maps/maps.ts","apps/platform/src/components/maps/maps.tsx","apps/platform/src/hooks/use-maps.ts","apps/platform/src/lib/iot/client.ts","apps/platform/src/hooks/use-iot.ts","apps/platform/src/lib/depin/types.ts","apps/platform/src/app/map/page.tsx","apps/platform/src/app/metering/smart-meters/page.tsx","apps/platform/src/app/depin/page.tsx","packages/programs/anchor/src/smart_grid.rs","packages/programs/anchor/src/metering.rs","packages/programs/anchor/src/depin.rs"];
  for(const file of files) assert.ok((await readFile(file,"utf8")).length>20,file);
});

test("sidebar exposes operational map navigation", async()=>{
  const sidebar=await readFile("packages/shared/src/constants/navigation.ts","utf8");
  for(const label of ["Renewables","Smart Grid","Smart Meters","DePIN & Helium"]) assert.match(sidebar,new RegExp(label));
});
