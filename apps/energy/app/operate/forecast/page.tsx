import { EmsBoundaryPage } from "../../../components/ems-boundary-page";
export default function ForecastPage(){return <EmsBoundaryPage title="Forecast" icon="forecast" description="Forecast generation, demand, storage state and grid exchange with horizon, confidence and model/source identity." sourceLabel="Forecasts require a versioned forecasting provider or model plus observed input state" requirements={[
  {label:"Horizon",value:"start/end + resolution"},{label:"Forecast value",value:"kW/MW or interval energy"},{label:"Confidence",value:"prediction interval / confidence score"},{label:"Model",value:"provider + model/version"},{label:"Generated at",value:"forecast creation timestamp"},{label:"Input freshness",value:"freshness of telemetry/weather/market inputs"}
]} cards={[
  {icon:"generation",title:"Generation Forecast",description:"Weather-adjusted expected renewable output.",href:"/monitor/generation"},{icon:"consumption",title:"Demand Forecast",description:"Expected site/facility demand and uncertainty.",href:"/monitor/consumption"},{icon:"storage",title:"Storage Projection",description:"Projected SOC and charge/discharge envelope.",href:"/monitor/storage"}
]}/>}
