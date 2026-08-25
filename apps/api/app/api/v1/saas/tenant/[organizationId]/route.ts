import { withApi } from "../../../../../../lib/api";
import { getPrismaClient } from "@powerchain/database";
import { appsForPlan, isAppId, isPlanId } from "@powerchain/saas";
export async function GET(req: Request, { params }: { params: Promise<{ organizationId: string }> }) {
  const { organizationId } = await params;
  return withApi(req, async ({ context }) => {
    if (context.organizationId && context.organizationId !== organizationId) throw Object.assign(new Error("Cross-organization tenant access denied"), { code: "TENANT_SCOPE_DENIED", status: 403 });
    const tenant = await getPrismaClient().saaSTenant.findUnique({ where: { organizationId }, include: { subscriptions: true } });
    if (!tenant) throw Object.assign(new Error("SaaS tenant not found"), { code: "NOT_FOUND", status: 404 });
    const plan = isPlanId(tenant.plan) ? tenant.plan : "STARTER";
    const subscriptionOverrides = new Map(tenant.subscriptions.map(item => [item.appId, item.enabled]));
    const apps = appsForPlan(plan).filter(app => subscriptionOverrides.get(app) !== false);
    for (const subscription of tenant.subscriptions) if (subscription.enabled && isAppId(subscription.appId) && !apps.includes(subscription.appId)) apps.push(subscription.appId);
    return { organizationId, tenantId: tenant.id, plan, status: tenant.status, apps, subscriptions: tenant.subscriptions };
  });
}
