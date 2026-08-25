# PowerChain Documentation

The repository root intentionally keeps only the main `README.md` and `CONTRIBUTING.md`. All other project documentation lives here.

## Start here

- `ARCHITECTURE.md` — system architecture
- `FULLSTACK.md` — full-stack boundaries and wiring
- `DESIGN-SYSTEM.md` — UI/UX system
- `DATABASE.md` — Prisma/PostgreSQL/Supabase workflow
- `API.md` — canonical `/api/v1` contract
- `AUTHENTICATION.md` — sessions and wallet authentication
- `SECURITY.md` — security model
- `ASSETS.md` — PWRC, wPWRC and Energy RWA boundaries
- `PACKAGES.md` — stable package baseline and upgrade policy
- `TOOLS.md` — repository automation
- `RELEASE.md` — release gates

## Structured documentation

```text
docs/
├── apps/       Application-specific notes
├── packages/   Shared package documentation
├── programs/   Solana program documentation
├── database/   Migration and database workflow notes
├── ai/         Extended AI/editor repository conventions
└── reports/    Generated validation/release reports
```

Tool-specific hidden instruction files remain in `.windsurf/` and `.github/` because those editors require those locations.

- [System management](./SYSTEM-MANAGEMENT.md) — status, sanitized configuration and degraded-mode policy.
