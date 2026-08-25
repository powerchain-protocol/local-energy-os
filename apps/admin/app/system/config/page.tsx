import { SystemEndpointPage } from "../../../components/system-endpoint-page";
export default function Page() {
  return <SystemEndpointPage title="Runtime Configuration" description="Sanitized environment, database, Redis, Solana and feature configuration. Secrets and credential-bearing URLs are never returned." endpoint="/api/v1/system/config" />;
}
