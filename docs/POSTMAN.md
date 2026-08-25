# Postman

Canonical HTTP artifacts live in `packages/api/postman`. The HTTP collection stays separate from WebSocket/gRPC specifications so it remains eligible for Postman HTTP mock servers and monitors.

Repository commands:

```text
pnpm postman:doctor
pnpm postman:mock:create
pnpm postman:monitor:create
pnpm postman:webhook:create
pnpm postman:flow:deploy
```

`POSTMAN_API_KEY`, `POSTMAN_WORKSPACE_ID` and `POSTMAN_COLLECTION_UID` are required for cloud provisioning. Set `POSTMAN_MONITOR_COLLECTION_UID` to the imported `PowerChain-Health` collection so scheduled monitors remain read-only. `POSTMAN_ENVIRONMENT_UID` is optional. The mock and monitor commands use Postman's public API. Webhook and Flow deployment use the Postman CLI, which must be installed and authenticated. Insights are produced from monitor/mock activity; they are not a standalone repository artifact to provision.


## Workspace service panels

The repository includes templates under `packages/api/postman/mock-servers`, `monitors`, `webhooks`, `insights`, and `flows`. Mock servers and monitors are provisioned through Postman's API; webhooks and deployed Flows use the authenticated Postman CLI. Insights appears after monitors/mock servers produce run data and is therefore observational rather than a separately created object.
