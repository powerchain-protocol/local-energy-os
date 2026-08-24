# @powerchain/infrastructure

Deployment assets for PowerChain 1.0.0:

- `docker` — multi-stage platform image and local PostgreSQL/Redis stack
- `k8s` — Kubernetes deployment and ingress
- `terraform` — cloud infrastructure foundation
- `vercel` — production Next.js build and security header configuration
- `cloudflare` — edge health check and secure origin proxy Worker
- `aws` — ECS/Fargate task definition for the platform container

Build from the repository root with `pnpm docker:build` so every workspace required by the standalone Next.js output is available.
