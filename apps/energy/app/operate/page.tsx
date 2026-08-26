import { ActionCard, InlineNotice, PageHeader, Panel, StatusBadge } from "@powerchain/ui";
import { EmsSafetyRail } from "../../components/ems-ui";

export default function OperatePage() {
  return <main className="pc-page ems-page">
    <PageHeader eyebrow="EMS · Plan & Operate" title="Plan & operate" description="Convert monitored physical state into forecasts, flexibility and bounded operating intent without bypassing constraints, policy or approval." action={<StatusBadge tone="warning">FAIL-CLOSED</StatusBadge>}/>
    <InlineNotice title="Planning is not execution" tone="warning" icon="shield">Forecasts and flexibility identify possible actions. Physical dispatch remains a separate safe-action workflow with simulation, policy, approval and post-action verification.</InlineNotice>
    <div className="pc-grid ems-grid-gap">
      <Panel className="pc-span-12" eyebrow="Execution safety" title="Operational decision path" description="Every state-changing action follows the same control sequence."><EmsSafetyRail/></Panel>
      <Panel className="pc-span-12" eyebrow="Plan & operate" title="Operating workspaces">
        <div className="pc-action-grid">
          <ActionCard icon="forecast" title="Forecast" description="Project generation, demand, storage state and grid exchange with horizon and confidence." meta="Model + input freshness" href="/operate/forecast"/>
          <ActionCard icon="flexibility" title="Flexibility" description="Determine controllable headroom, windows, limits, duration and confidence." meta="Capability, not dispatch" href="/operate/flexibility"/>
          <ActionCard icon="dispatch" title="Dispatch" description="Prepare bounded operating intent through the PowerChain safe-action policy." meta="Review required" href="/operate/dispatch"/>
          <ActionCard icon="grid" title="Grid" description="Apply connection topology, limits, outages and constraints to operating decisions." meta="Electrical boundary" href="/operate/grid"/>
        </div>
      </Panel>
    </div>
  </main>;
}
