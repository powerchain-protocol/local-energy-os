import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export interface DashboardHeroProps {
  roleLabel: string;
  title: string;
  subtitle: string;
  quickActions: readonly string[];
  canTrade: boolean;
}

export function DashboardHero({ roleLabel, title, subtitle, quickActions, canTrade }: DashboardHeroProps) {
  return (
    <header className="dashboard-hero">
      <div>
        <p className="eyebrow">{roleLabel} workspace</p>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="dashboard-actions">
        <span className="live-chip"><i />Digital Energy OS</span>
        {quickActions.slice(0, 2).map((label, index) => (
          <Link key={label} href={index === 0 && canTrade ? "/marketplace" : "/settings"}>
            {label}<ArrowUpRight />
          </Link>
        ))}
      </div>
    </header>
  );
}
