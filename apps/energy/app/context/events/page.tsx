"use client";
import { DataTable, DataValue, InlineNotice, PageHeader, Panel, Skeleton, StatusBadge, TableToolbar } from "@powerchain/ui";
import { EmsMetadataContract } from "../../../components/ems-ui";
import { useEnergyResource } from "../../../components/use-energy-resource";
type Transports={rest:{version:string;basePath:string;openapi:string;swagger:string};websocket:{version:string;url:string;ticketEndpoint:string;configured:boolean};grpc:{version:string;address:string;protoRoot:string;configured:boolean}};
type TransportRow={id:string;transport:string;endpoint:string;version:string;configured:boolean;meta:string};
export default function EventsPage(){
  const t=useEnergyResource<Transports>("/api/v1/system/transports");
  const rows:TransportRow[]=t.data?[
    {id:"websocket",transport:"WebSocket",endpoint:t.data.websocket.url||"—",version:t.data.websocket.version,configured:t.data.websocket.configured,meta:"Realtime operational event delivery"},
    {id:"grpc",transport:"gRPC",endpoint:t.data.grpc.address||"—",version:t.data.grpc.version,configured:t.data.grpc.configured,meta:"Internal service/streaming boundary"},
    {id:"rest",transport:"REST",endpoint:t.data.rest.basePath||"/api/v1",version:t.data.rest.version,configured:true,meta:"Canonical request/response API"}
  ]:[];
  return <main className="pc-page ems-page"><PageHeader eyebrow="EMS · Events" title="Events & realtime" description="Operational events preserve source, sequence, observed time, received time and correlation identity across REST, WebSocket and gRPC transports." action={<StatusBadge tone={t.error?"warning":"info"}>{t.loading?"CHECKING":"TRANSPORTS"}</StatusBadge>}/><InlineNotice title="Events are evidence, not inferred state" tone="info" icon="events">A realtime event updates an operational projection only after schema, source identity, ordering/deduplication and freshness checks succeed.</InlineNotice><div className="pc-grid ems-grid-gap"><Panel className="pc-span-7" eyebrow="Realtime transports" title="Event delivery" description="Transport availability is separate from physical telemetry availability.">{t.loading?<Skeleton lines={5}/>:<div className="ems-event-table"><TableToolbar title="Transport health" count={rows.length} description="On mobile, each row reflows into a labeled operational record instead of a horizontal table."/><DataTable rows={rows} rowKey={(row)=>row.id} columns={[
    {key:"transport",header:"Transport",cell:(row)=><DataValue value={row.transport} meta={row.meta}/>},
    {key:"endpoint",header:"Endpoint",cell:(row)=><DataValue value={row.endpoint} meta={`v${row.version}`}/>},
    {key:"state",header:"State",align:"right",cell:(row)=><StatusBadge tone={row.configured?"success":"warning"}>{row.configured?"Configured":"Unconfigured"}</StatusBadge>}
  ]}/></div>}</Panel><Panel className="pc-span-5" eyebrow="Event contract" title="Required event metadata"><EmsMetadataContract items={[
    {label:"eventId",value:"Required",meta:"Stable unique event identity"},{label:"source",value:"Required",meta:"Device/service/adapter identity"},{label:"observedAt",value:"Required",meta:"Physical/source time"},{label:"receivedAt",value:"Required",meta:"Platform ingest time"},{label:"sequence",value:"Recommended",meta:"Ordering/replay protection"},{label:"correlationId",value:"Required for workflows",meta:"Cross-service tracing"}
  ]}/></Panel></div></main>;
}
