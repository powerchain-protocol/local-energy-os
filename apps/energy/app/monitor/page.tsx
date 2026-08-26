import { ActionCard, InlineNotice, PageHeader, Panel, StatusBadge } from "@powerchain/ui";
import { EmsRequirements } from "../../components/ems-ui";

export default function MonitorPage() {
  return <main className="pc-page ems-page">
    <PageHeader eyebrow="EMS · Monitor" title="Monitor physical energy" description="Observe generation, demand, storage and grid exchange with explicit units, source identity, observation time, freshness and quality." action={<StatusBadge tone="info">PHYSICAL STATE</StatusBadge>}/>
    <InlineNotice title="Physical state is authoritative" tone="info" icon="shield">Market prices, blockchain state and forecasts can add context, but they cannot replace measured or verified physical energy state.</InlineNotice>
    <div className="pc-grid ems-grid-gap">
      <Panel className="pc-span-8" eyebrow="Monitor" title="Operational views" description="Choose the physical-state surface that matches the question you are answering.">
        <div className="pc-action-grid">
          <ActionCard icon="flow" title="Live Flow" description="Generation, demand, storage and grid exchange at a common source timestamp." meta="kW / MW · kV · Hz" href="/monitor/live-flow"/>
          <ActionCard icon="generation" title="Generation" description="Current generation when telemetry is available, plus verified generation evidence." meta="Power + energy evidence" href="/monitor/generation"/>
          <ActionCard icon="consumption" title="Consumption" description="Site and facility demand with interval, quality and confidence metadata." meta="Power + interval energy" href="/monitor/consumption"/>
          <ActionCard icon="storage" title="Storage" description="SOC, charge/discharge power, energy availability and thermal state." meta="SOC % · MW · MWh · °C" href="/monitor/storage"/>
        </div>
      </Panel>
      <Panel className="pc-span-4" eyebrow="Trust contract" title="A live value needs provenance" description="PowerChain does not promote an unqualified number into operational state.">
        <EmsRequirements items={[
          { label: "Value", value: "Explicit engineering unit" },
          { label: "Source", value: "Meter / device / gateway / SCADA" },
          { label: "Observed", value: "Authoritative source timestamp" },
          { label: "Received", value: "Platform ingest timestamp" },
          { label: "Freshness", value: "Signal-specific threshold" },
          { label: "Quality", value: "VALID / ESTIMATED / SUSPECT / MISSING" },
        ]}/>
      </Panel>
    </div>
  </main>;
}
