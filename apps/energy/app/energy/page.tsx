"use client";

import { formatEnergy } from "@powerchain/energy-core";
import { ActionCard, InlineNotice, PageHeader, Panel, Skeleton, StatusBadge } from "@powerchain/ui";
import { EmsFlowBoard, EmsMetadataContract, EmsMetric, EmsSafetyRail } from "../../components/ems-ui";
import { useEnergyResource } from "../../components/use-energy-resource";

type CommandCenter = {
  runtime: { environment: string; operatingMode: string; dataMode: string; writeMode: string; network: string };
  energyLedger: { batchCount: number; verifiedWh: string; positionedWh: string; retiredWh: string; availableVerifiedWh: string };
  rwa: { reservedWh: string; activeOperations: number };
};

function energy(value?: string) { try { return formatEnergy(BigInt(value ?? "0")); } catch { return { value: "—", unit: "" }; } }

export default function EnergyManagementPage() {
  const command = useEnergyResource<CommandCenter>("/api/v1/energy/command-center");
  const verified = energy(command.data?.energyLedger.verifiedWh);
  const available = energy(command.data?.energyLedger.availableVerifiedWh);
  const reserved = energy(command.data?.rwa.reservedWh);
  const retired = energy(command.data?.energyLedger.retiredWh);

  return <main className="pc-page ems-page">
    <PageHeader eyebrow="Energy Management System" title="Energy operations" description="Real-time physical state, verification, forecasting, flexibility and dispatch—kept separate from settlement and token balances." action={<><StatusBadge tone={command.error ? "warning" : "success"}>{command.loading ? "Refreshing" : command.error ? "Degraded" : "Control plane connected"}</StatusBadge>{command.data?.runtime.operatingMode ? <StatusBadge tone={command.data.runtime.operatingMode === "LIVE" ? "success" : "info"}>{command.data.runtime.operatingMode}</StatusBadge> : null}</>} />

    <InlineNotice title="Live telemetry is not inferred" tone="info" icon="shield">The current backend exposes settlement-grade Energy Proofs/Batches but not a canonical live telemetry feed for generation kW, demand kW, storage SOC or grid exchange. Those values remain unavailable until an authoritative EMS/SCADA/meter integration is connected.</InlineNotice>

    <div className="ems-live-metrics">
      <EmsMetric icon="generation" label="Generation" value="—" unit="kW" meta="Solar, wind, hydro or other live generation" freshness="UNCONFIGURED"/>
      <EmsMetric icon="consumption" label="Demand" value="—" unit="kW" meta="Site or facility demand at source timestamp" freshness="UNCONFIGURED"/>
      <EmsMetric icon="storage" label="Storage SOC" value="—" unit="%" meta="SOC, charge/discharge state and availability" freshness="UNCONFIGURED"/>
      <EmsMetric icon="grid" label="Grid exchange" value="—" unit="kW" meta="Import/export at the connection point" freshness="UNCONFIGURED"/>
    </div>

    <div className="pc-grid ems-grid-gap">
      <Panel className="pc-span-8" eyebrow="Live flow" title="Physical energy flow" description="Generation, demand, storage and grid exchange must share one source timestamp and explicit power units." action={<a className="pc-control-button" href="/energy/live-flow">Open live flow</a>}>
        <EmsFlowBoard
          generation={{ label: "Generation", unit: "kW", meta: "Awaiting live source", icon: "generation" }}
          demand={{ label: "Demand", unit: "kW", meta: "Awaiting live source", icon: "consumption" }}
          storage={{ label: "Storage", unit: "kW", meta: "SOC + power required", icon: "storage" }}
          grid={{ label: "Grid", unit: "kW", meta: "Import/export required", icon: "grid" }}
        />
      </Panel>

      <Panel className="pc-span-4" eyebrow="State quality" title="Freshness contract" description="Every EMS value carries time, source and confidence/freshness metadata.">
        <EmsMetadataContract items={[
          { label: "Telemetry state", value: "UNCONFIGURED", meta: "No canonical live feed" },
          { label: "Timestamp", value: "Required", meta: "Source observation time" },
          { label: "Freshness", value: "Required", meta: "LIVE / STALE / DEGRADED / OFFLINE" },
          { label: "Units", value: "kW / MW", meta: "Power state; energy stays Wh/kWh/MWh" },
          { label: "Source", value: "Required", meta: "Meter, SCADA, EMS, inverter or gateway" },
        ]}/>
      </Panel>

      <Panel className="pc-span-12" eyebrow="Verified energy" title="Settlement-grade evidence already available" description="These are verified physical-energy quantities, not instantaneous power readings.">
        {command.loading ? <Skeleton lines={3}/> : <div className="ems-evidence-strip">
          <div><span>Verified</span><strong>{verified.value}<small>{verified.unit}</small></strong><em>{command.data?.energyLedger.batchCount ?? 0} batches</em></div>
          <div><span>Available backing</span><strong>{available.value}<small>{available.unit}</small></strong><em>Not yet positioned</em></div>
          <div><span>Reserved</span><strong>{reserved.value}<small>{reserved.unit}</small></strong><em>{command.data?.rwa.activeOperations ?? 0} active operations</em></div>
          <div><span>Retired</span><strong>{retired.value}<small>{retired.unit}</small></strong><em>Finalized claims</em></div>
        </div>}
      </Panel>

      <Panel className="pc-span-8" eyebrow="Dispatch control" title="Simulation before execution" description="Dispatch is a policy-controlled action path, not a dashboard button.">
        <EmsSafetyRail/>
      </Panel>
      <Panel className="pc-span-4" eyebrow="Operator priorities" title="EMS workflow" description="Move from observation to prediction to bounded execution.">
        <div className="ems-action-stack">
          <ActionCard href="/energy/forecast" icon="forecast" title="Forecast" description="Compare expected generation, demand and storage state." meta="Prediction only"/>
          <ActionCard href="/energy/flexibility" icon="flexibility" title="Flexibility" description="Inspect controllable capacity and availability windows." meta="No dispatch"/>
          <ActionCard href="/energy/dispatch" icon="dispatch" title="Dispatch" description="Simulate, approve, execute and verify a bounded action." meta="Policy gated"/>
        </div>
      </Panel>
    </div>
  </main>;
}
