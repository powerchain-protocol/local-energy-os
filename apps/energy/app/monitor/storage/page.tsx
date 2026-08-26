import { EmsBoundaryPage } from "../../../components/ems-boundary-page";
export default function StoragePage(){return <EmsBoundaryPage title="Storage" icon="storage" description="Battery state-of-charge, charge/discharge power, energy capacity, availability and thermal/cycle state." sourceLabel="Storage state requires a BMS/PCS or verified storage-controller integration" requirements={[
  {label:"SOC",value:"% + observed timestamp"},{label:"Power",value:"kW / MW + charge/discharge direction"},{label:"Energy",value:"available/usable kWh or MWh"},{label:"Temperature",value:"°C with sensor source"},{label:"Availability",value:"available / limited / unavailable"},{label:"Cycle state",value:"idle / charging / discharging / fault"}
]} cards={[
  {icon:"forecast",title:"Storage Forecast",description:"Projected SOC under expected generation and demand.",href:"/operate/forecast"},{icon:"flexibility",title:"Available Flexibility",description:"Charge/discharge headroom within operating limits.",href:"/operate/flexibility"},{icon:"dispatch",title:"Dispatch",description:"Simulation and policy gate before any controller command.",href:"/operate/dispatch"}
]} safety/>}
