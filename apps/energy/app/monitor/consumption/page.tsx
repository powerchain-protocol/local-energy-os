import { EmsBoundaryPage } from "../../../components/ems-boundary-page";
export default function ConsumptionPage(){return <EmsBoundaryPage title="Consumption" icon="consumption" description="Facility/site demand with explicit power, energy interval, timestamp and confidence." sourceLabel="Consumption requires authoritative meter, BMS, SCADA or utility interval data" requirements={[
  {label:"Power",value:"kW / MW"},{label:"Energy",value:"Wh / kWh / MWh per interval"},{label:"Interval",value:"start/end + timezone"},{label:"Timestamp",value:"source observation time"},{label:"Confidence",value:"measured / estimated / corrected"},{label:"Meter/source",value:"stable source identity"}
]} cards={[
  {icon:"flow",title:"Live Flow",description:"Relate demand to generation, storage and grid exchange.",href:"/monitor/live-flow"},{icon:"forecast",title:"Demand Forecast",description:"Compare actual demand with forecast and confidence bands.",href:"/operate/forecast"},{icon:"flexibility",title:"Demand Flexibility",description:"Identify shiftable or curtailable demand without executing it.",href:"/operate/flexibility"}
]}/>}
