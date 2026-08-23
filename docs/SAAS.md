# SaaS Control Plane

Canonical application: `apps/platform/`.

Responsibilities: tenant management, subscriptions, plans, application catalog, feature entitlements, organization access, environment configuration, and account administration.

```text
Tenant → Subscription → Plan → Apps → Features → Permissions
```

Canonical APIs:

- `GET /api/v1/saas/apps`
- `GET /api/v1/saas/tenant/:organizationId`
- `POST /api/v1/saas/entitlements/resolve`

Entitlements resolve tenant, organization, subscription, plan, application, feature, participant type, and workspace context so product packaging never leaks into application-specific UI code.
