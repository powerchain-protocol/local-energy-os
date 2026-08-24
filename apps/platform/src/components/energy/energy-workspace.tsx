"use client";

import Link from "next/link";
import { ActivityLogIcon, BarChartIcon, LightningBoltIcon, SunIcon } from "@radix-ui/react-icons";
import { ROUTES } from "@/config/routes";
import { ProfessionalAreaChart } from "@/components/charts/professional-area-chart";

const metrics = [
  { label: "Live generation", value: "84.6 MW", change: "+6.8%", detail: "Across 27 connected assets" },
  { label: "Renewable share", value: "92.4%", change: "+2.1%", detail: "Current portfolio output" },
  { label: "Storage available", value: "31.8 MWh", change: "74%", detail: "Dispatchable battery capacity" },
  { label: "Forecast confidence", value: "96.2%", change: "+0.8%", detail: "Next 24-hour model" },
];

const modules = [
  { href: ROUTES.energySolar, title: "Solar operations", body: "PV generation, inverter health and irradiance forecasts.", icon: SunIcon },
  { href: ROUTES.energyWind, title: "Wind operations", body: "Turbine output, availability and wake-aware production.", icon: ActivityLogIcon },
  { href: ROUTES.energyStorage, title: "Battery storage", body: "State of charge, reserve capacity and dispatch windows.", icon: LightningBoltIcon },
  { href: ROUTES.energyForecast, title: "Forecast & dispatch", body: "Demand, weather, production and market scheduling.", icon: BarChartIcon },
];

export function EnergyWorkspace() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">Renewable operations</p>
          <h1 className="page-title">Energy command center</h1>
          <p className="page-subtitle">Monitor generation, forecast output, coordinate storage and dispatch renewable energy across the portfolio.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold shadow-sm transition hover:-translate-y-px hover:shadow-md" href={ROUTES.renewables}>Open map</Link>
          <Link className="rounded-xl bg-emerald-900 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(6,78,59,.18)] transition hover:-translate-y-px hover:bg-emerald-800" href={ROUTES.exchange}>Trade energy</Link>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <article key={metric.label} className="panel p-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(15,23,42,.08)]">
            <div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold text-[var(--muted)]">{metric.label}</p><span className="status-badge">{metric.change}</span></div>
            <p className="mt-3 text-3xl font-black tracking-tight">{metric.value}</p>
            <p className="mt-2 text-xs text-[var(--muted)]">{metric.detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(20rem,.8fr)]">
        <div className="panel p-5"><div className="mb-4"><p className="eyebrow">Generation profile</p><h2 className="mt-1 text-xl font-extrabold">Supply and dispatch</h2></div><ProfessionalAreaChart data={[{name:"06:00",value:32},{name:"09:00",value:58},{name:"12:00",value:86},{name:"15:00",value:91},{name:"18:00",value:64},{name:"21:00",value:39}]} /></div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          {modules.map(({ href, title, body, icon: Icon }) => (
            <Link key={href} href={href} className="group panel flex items-start gap-4 p-4 transition duration-200 hover:-translate-y-0.5 hover:border-emerald-700/25 hover:shadow-[0_14px_34px_rgba(15,23,42,.07)]">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"><Icon className="h-5 w-5" /></span>
              <span><strong className="block text-sm">{title}</strong><span className="mt-1 block text-xs leading-5 text-[var(--muted)]">{body}</span></span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
