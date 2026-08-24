export function HealthPanel() {
  return <article className="dashboard-panel"><div className="dashboard-card-head"><div><span className="eyebrow">Real-time</span><h2>System status</h2></div><span className="success-label">Operational</span></div><div className="system-score"><strong>98.7%</strong><span>Grid health</span></div><div className="health-bars"><i style={{width:"98.7%"}}/><i style={{width:"97.1%"}}/><i style={{width:"96.3%"}}/></div><div className="health-labels"><span>Stability 98.7%</span><span>Resilience 97.1%</span><span>Efficiency 96.3%</span></div></article>;
}
