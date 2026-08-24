import { Activity, BatteryCharging, Cpu, RadioTower } from "lucide-react";
const assets = [
  { label: "Connected assets", value: "15,482", change: "+3.4%", icon: Cpu },
  { label: "Active devices", value: "2.4M+", change: "+2.7%", icon: RadioTower },
  { label: "Grid reliability", value: "99.99%", change: "+0.02%", icon: Activity },
  { label: "Energy storage", value: "86.3 GWh", change: "+6.1%", icon: BatteryCharging },
];
export function AssetStrip(){return <section className="asset-strip">{assets.map(({label,value,change,icon:Icon})=><article key={label}><div className="asset-icon"><Icon/></div><span>{label}</span><strong>{value}</strong><small>{change}</small></article>)}</section>}
