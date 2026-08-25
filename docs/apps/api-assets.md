# PowerChain API Contract

This directory contains the canonical developer-facing API artifacts for **PowerChain Local Energy OS v1.0.0**.

## Contents

- `openapi.yaml` — OpenAPI 3.1 source of truth used by Swagger UI.
- `packages/api/postman/PowerChain-Local-Energy-OS.postman_collection.json` — importable Postman collection.
- `packages/api/postman/PowerChain-Local.postman_environment.json` — local development environment.

## Runtime endpoints

When `@powerchain/app-api` is running on port `3002`:

- Developer portal: `http://localhost:3002/`
- Canonical OpenAPI: `packages/api/swagger/openapi.yaml`
- Swagger UI: `http://localhost:3002/docs`
- OpenAPI YAML: `http://localhost:3002/openapi.yaml`
- API namespace: `http://localhost:3002/api/v1`

## Contract policy

All public API v1 route additions must be reflected in `openapi.yaml` and, where useful for interactive development, the Postman collection. Run:

```bash
pnpm api:docs:verify
```

before merging API changes.
