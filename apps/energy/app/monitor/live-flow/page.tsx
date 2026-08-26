import { InlineNotice, PageHeader, Panel, StatusBadge } from "@powerchain/ui";
import { EmsFlowBoard, EmsMetadataContract, EmsRequirements } from "../../../components/ems-ui";

export default function LiveFlowPage() {
  return <main className="pc-page ems-page">
    <PageHeader eyebrow="EMS · Live Flow" title="Live energy flow" description="One operational view of generation, demand, storage and grid exchange at a common source timestamp." action={<StatusBadge tone="neutral">UNCONFIGURED</StatusBadge>}/>
    <InlineNotice title="No canonical telemetry source connected" tone="warning" icon="warning">Live flow requires synchronized physical telemetry. Verified Energy Batches cannot be reverse-engineered into instantaneous kW or storage SOC.</InlineNotice>
    <div className="pc-grid ems-grid-gap">
      <Panel className="pc-span-9" eyebrow="Physical topology" title="Site energy balance" description="Positive/negative direction, units and timestamp must be explicit before a flow is shown as LIVE.">
        <EmsFlowBoard
          generation={{ label:"Generation", unit:"kW", meta:"Solar / wind / hydro / CHP", icon:"generation" }}
          demand={{ label:"Demand", unit:"kW", meta:"Facility or site load", icon:"consumption" }}
          storage={{ label:"Storage", unit:"kW", meta:"Charge/discharge + SOC", icon:"storage" }}
          grid={{ label:"Grid", unit:"kW", meta:"Import/export at connection point", icon:"grid" }}
        />
      </Panel>
      <Panel className="pc-span-3" eyebrow="Quality" title="Live-state contract" description="A single value without these fields is not operational state.">
        <EmsMetadataContract items={[
          {label:"Timestamp",value:"Required",meta:"Observed at source"},
          {label:"Freshness",value:"Required",meta:"Threshold by signal class"},
          {label:"Power unit",value:"kW / MW",meta:"Never ambiguous"},
          {label:"Direction",value:"Required",meta:"Import/export or charge/discharge"},
          {label:"Source ID",value:"Required",meta:"Meter, device, gateway or SCADA tag"},
          {label:"Quality",value:"Required",meta:"Valid / estimated / suspect / missing"},
        ]}/>
      </Panel>
      <div className="pc-span-12"><EmsRequirements items={[
        {label:"Generation",value:"kW/MW · source · timestamp · quality"},
        {label:"Demand",value:"kW/MW · interval · confidence"},
        {label:"Storage",value:"SOC % · kW/MW · MWh · temperature · availability"},
        {label:"Grid",value:"Import/export kW/MW · connection point · limit · constraint"},
      ]}/></div>
    </div>
  </main>;
}
