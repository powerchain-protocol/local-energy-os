import { BatteryCharging, CarFront, Gauge, RadioTower, SolarPanel, Wind } from "lucide-react";
import { Shell } from "@/components/shell";

const devices=[
  ["Smart meters","284","DLMS/COSEM · interval evidence",Gauge],
  ["Solar sites","96","Inverters · meters · local export",SolarPanel],
  ["Community batteries","34","SOC · charge/discharge · provenance",BatteryCharging],
  ["EV charge points","42","OCPP · ISO 15118 · local flexibility",CarFront],
  ["Wind assets","12","Production · curtailment · forecast",Wind],
  ["Edge gateways","18","MQTT · OPC UA · Modbus",RadioTower],
] as const;

export default function LocalEnergyDevicesPage(){
  return <Shell><div className="content-container space-y-6">
    <header className="local-energy-section-hero"><span className="eyebrow">LOCAL ENERGY · DEVICES & EDGE</span><h1>Energy infrastructure is a first-class product surface.</h1><p>PowerChain connects meters, DER assets, storage, EV charging and edge gateways to the operational Digital Twin without making blockchain the physical source of truth.</p></header>
    <section className="local-energy-device-grid">{devices.map(([label,value,description,Icon])=><article key={label}><Icon/><span>{label}</span><strong>{value}</strong><p>{description}</p></article>)}</section>
  </div></Shell>;
}
