import { ActionCard, EmptyState, InlineNotice, PageHeader, Panel, StatusBadge } from "@powerchain/ui";
import { EmsBoundaryCard, EmsRequirements, EmsSafetyRail, type EmsFreshness } from "./ems-ui";
import type { PowerChainIconName } from "@powerchain/ui";

export function EmsBoundaryPage({ eyebrow = "Energy Management System", title, description, icon, state = "UNCONFIGURED", sourceLabel, requirements, cards, safety = false }: {
  eyebrow?: string;
  title: string;
  description: string;
  icon: PowerChainIconName;
  state?: EmsFreshness;
  sourceLabel: string;
  requirements: Array<{ label: string; value: string }>;
  cards: Array<{ icon: PowerChainIconName; title: string; description: string; meta?: string; href?: string }>;
  safety?: boolean;
}) {
  return <main className="pc-page ems-page">
    <PageHeader eyebrow={eyebrow} title={title} description={description} action={<StatusBadge tone="neutral">{state}</StatusBadge>} />
    <InlineNotice title="Operational data boundary" tone="info" icon="shield">{sourceLabel}. PowerChain will not synthesize live state from settlement-grade energy totals or historical records.</InlineNotice>
    <div className="pc-grid ems-grid-gap">
      <Panel className="pc-span-8" eyebrow="Operational surface" title={`${title} state`} description="This surface becomes operational only when authoritative telemetry or a verified integration supplies the required state.">
        <EmptyState icon={icon} title={`${title} is not connected`} description="Connect the authoritative data source to promote this workspace from UNCONFIGURED to LIVE/FRESH. Until then, no physical state or forecast is inferred." />
      </Panel>
      <Panel className="pc-span-4" eyebrow="Data contract" title="Required metadata" description="Explicit units, timestamps and source identity are mandatory.">
        <EmsRequirements items={requirements}/>
      </Panel>
      {safety ? <Panel className="pc-span-12" eyebrow="Dispatch safety" title="No physical action bypasses verification" description="Every control action follows a bounded, auditable decision path before and after execution."><EmsSafetyRail/></Panel> : null}
      <Panel className="pc-span-12" eyebrow="Next operational surfaces" title="Connected EMS workflow" description="The UI keeps observation, prediction, flexibility and execution as distinct responsibilities.">
        <div className="pc-action-grid">{cards.map((card) => <ActionCard key={card.title} icon={card.icon} title={card.title} description={card.description} meta={card.meta} href={card.href}/>)}</div>
      </Panel>
      <div className="pc-span-12 ems-boundary-summary">
        <EmsBoundaryCard icon="shield" title="Physical state remains authoritative" description="Blockchain, settlement and AI can enrich or act on verified state, but they never manufacture generation, demand, SOC, grid exchange or timestamps." state={state}/>
      </div>
    </div>
  </main>;
}
