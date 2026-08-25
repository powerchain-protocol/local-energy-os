import { SystemEndpointPage } from "../../../components/system-endpoint-page";
export default function Page() {
  return <SystemEndpointPage title="System Status" description="Canonical runtime and subsystem state. Use the API deep probe when connectivity verification is required." endpoint="/api/v1/system/status" />;
}
