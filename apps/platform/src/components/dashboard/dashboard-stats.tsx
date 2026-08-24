import { Activity, CircleAlert, Leaf, Zap } from "lucide-react";

export function DashboardStats() {
  return (
    <section className="dashboard-stat-grid" aria-label="Operations summary">
      <article className="dashboard-primary-stat"><div><span>Total generation</span><strong>365.7 <small>GW</small></strong><p>+5.2% vs last hour</p></div><Zap/><div className="primary-stat-glow"/></article>
      <article><Leaf/><div><span>Carbon avoided</span><strong>1.24M tCO₂</strong><p>+8.7% this month</p></div></article>
      <article><Activity/><div><span>Grid efficiency</span><strong>97.8%</strong><p>+1.3% today</p></div></article>
      <article><CircleAlert/><div><span>Open incidents</span><strong>3</strong><p>2 require review</p></div></article>
    </section>
  );
}
