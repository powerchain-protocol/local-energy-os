export function WhitepaperCover() {
  return (
    <section className="whitepaper-cover">
      <div className="cover-copy">
        <div className="eyebrow">WHITEPAPER · VERSION 1.0.0</div>
        <h1>PowerChain Local Energy OS</h1>
        <p className="cover-subtitle">
          Energy Infrastructure, Verified Energy RWA, Multi-Chain Settlement &amp; Machine Economy
        </p>
        <div className="cover-tags" aria-label="Whitepaper topics">
          <span>Local Energy</span>
          <span>Smart Metering</span>
          <span>SaaS</span>
          <span>Energy RWA</span>
          <span>Solana</span>
          <span className="sui-tag">Sui</span>
          <span>Machine Economy</span>
        </div>
      </div>

      <div className="asset-architecture" aria-label="Canonical asset architecture">
        <div className="asset-card">
          <img src="/assets/pwrc.jpeg" alt="PWRC asset icon" />
          <div>
            <strong>PWRC</strong>
            <span>Native · Solana</span>
          </div>
        </div>
        <div className="bridge-line" aria-hidden="true"><span>1:1 bridge</span></div>
        <div className="asset-card sui">
          <img src="/assets/wpwrc.jpeg" alt="wPWRC asset icon" />
          <div>
            <strong>wPWRC</strong>
            <span>Bridged · Sui</span>
          </div>
        </div>
        <div className="energy-card">
          <span className="energy-value">kWh / MWh</span>
          <strong>Verified Energy RWA</strong>
          <small>Canonical backing: integer Wh</small>
        </div>
      </div>
    </section>
  );
}
