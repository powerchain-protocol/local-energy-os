# SaaS Platform

`apps/platform` is the Local Energy OS SaaS control-plane integration boundary.

Canonical surfaces:

```text
/
├── tenants
├── apps
├── energy-rwa
├── pwrc
├── networks
├── programs
├── machine-economy
├── integrations
├── system
└── settings
```

The SaaS resolution model is:

```text
Identity → Tenant → Organization → Subscription → Plan
→ Participant Type → Entitlements → Quotas → Workspace Context
→ Permission / Policy → Domain Service → Audit
```

Canonical plans are `COMMUNITY`, `PRO`, `GRID_OPERATOR`, and `ENTERPRISE`.
