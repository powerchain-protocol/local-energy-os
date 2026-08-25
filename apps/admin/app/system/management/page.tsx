import { SystemEndpointPage } from "../../../components/system-endpoint-page";
export default function Page() {
  return <SystemEndpointPage title="Management Policies" description="Write, settlement, market, bridge and rewards execution gates derived from runtime and degraded-service policy." endpoint="/api/v1/system/management" />;
}
