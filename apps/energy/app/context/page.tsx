import { ActionCard, InlineNotice, PageHeader, Panel, StatusBadge } from "@powerchain/ui";
import { EmsMetadataContract } from "../../components/ems-ui";

export default function ContextPage() {
  return <main className="pc-page ems-page">
    <PageHeader eyebrow="EMS · Context" title="Operational context" description="Bring markets, events and external-system evidence into decisions while keeping physical energy state and grid constraints authoritative." action={<StatusBadge tone="info">CONTEXTUAL DATA</StatusBadge>}/>
    <InlineNotice title="Context cannot overwrite physical truth" tone="info" icon="activity">Market, event and protocol data can explain or price an operating condition; they cannot manufacture telemetry, delivery evidence or controller state.</InlineNotice>
    <div className="pc-grid ems-grid-gap">
      <Panel className="pc-span-8" eyebrow="Context" title="Decision context">
        <div className="pc-action-grid">
          <ActionCard icon="market" title="Markets" description="Review price context, reservations and economic commitments alongside physical availability." meta="Economic context" href="/context/markets"/>
          <ActionCard icon="events" title="Events" description="Inspect realtime delivery transports and operational event evidence." meta="REST · WebSocket · gRPC" href="/context/events"/>
        </div>
      </Panel>
      <Panel className="pc-span-4" eyebrow="Context contract" title="Keep evidence attributable">
        <EmsMetadataContract items={[
          { label: "Source", value: "Required", meta: "Provider or originating service" },
          { label: "Observed at", value: "Required", meta: "Event/market source time" },
          { label: "Received at", value: "Required", meta: "Platform ingest time" },
          { label: "Scope", value: "Required", meta: "Site / market / network context" },
          { label: "Correlation", value: "When actionable", meta: "Link to decision or workflow" },
        ]}/>
      </Panel>
    </div>
  </main>;
}
