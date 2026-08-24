import test from'node:test';import assert from'node:assert/strict';import fs from'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
test('AI package boundaries exist',()=>{for(const p of['packages/ai-core/src/index.ts','packages/ai-gateway/src/index.ts','packages/ai-ui/src/index.ts','packages/credits/src/index.ts'])assert.ok(fs.existsSync(p),p)});
test('AI routes and quote API exist',()=>{for(const p of['apps/platform/src/app/dashboard/ai/page.tsx','apps/platform/src/app/dashboard/ai/chat/page.tsx','apps/platform/src/app/api/v1/ai/quote/route.ts','apps/platform/src/app/api/v1/ai/providers/route.ts'])assert.ok(fs.existsSync(p),p)});
test('PWRC pricing uses fixed point arithmetic',()=>{const s=read('packages/credits/src/index.ts');assert.match(s,/BigInt/);assert.match(s,/quotePwrc/)});
