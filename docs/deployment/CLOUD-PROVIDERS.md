# Cloud providers

PowerChain separates application builds from deployment targets. Run `pnpm validate`, `pnpm typecheck`, and `pnpm build` before promoting a release, then inject secrets with the selected provider rather than committing them.

## Vercel

Create a Vercel project with the repository root as its working directory. Use `pnpm --filter @powerchain/platform build` as the build command and `apps/platform` as the application root when configuring the project. The canonical JSON in `packages/infrastructure/vercel/vercel.json` pins the framework, install command, build command, regions, and response security headers. Configure the database, Supabase publishable/secret keys, provider credentials, and public URLs in Vercel environment settings.

## Cloudflare

The Worker in `packages/infrastructure/cloudflare` is an edge gateway in front of a deployed PowerChain origin. It exposes `/health/live`, proxies allowed HTTP methods to the `ORIGIN_URL` secret, preserves paths and queries, attaches request IDs, and adds baseline response security headers. Deploy it from that directory with Wrangler after setting `ORIGIN_URL` as a secret. Keep application credentials at the origin; the edge Worker does not receive database or payment secrets.

## AWS

Build and publish `packages/infrastructure/docker/Dockerfile` to ECR as `powerchain/platform:1.0.0`. The ECS/Fargate task definition in `packages/infrastructure/aws` uses port 3000, a read-only root filesystem, health checks, CloudWatch logs, and Secrets Manager references. Replace the account, region, execution role, task role, log group, image, and secret ARNs during deployment. Use RDS PostgreSQL, ElastiCache Redis, S3, CloudFront, and an Application Load Balancer as required by the environment.

## Promotion checklist

1. Run the complete quality gates and build.
2. Apply canonical Prisma migrations from `packages/database/prisma/migrations`.
3. Store server-only credentials in the provider secret manager.
4. Verify `/health/live` and `/health/ready` for every deployed service.
5. Exercise checkout, marketplace, integration, WebSocket, and worker smoke paths.
6. Promote the immutable `1.0.0` image or deployment artifact.
