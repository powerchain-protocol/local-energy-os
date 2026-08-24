"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Fingerprint,
  LockKeyhole,
  RefreshCw,
  Send,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  XCircle,
} from "lucide-react";
import { Shell } from "@/components/shell";
import type { DigitalEnergyApiEnvelope, DigitalEnergyControlsPayload } from "./types";

function shortHash(value?: string) {
  if (!value) return "—";
  return value.length > 20 ? `${value.slice(0, 12)}…${value.slice(-8)}` : value;
}

function settlementAmount(asset: string, amountMinor: string) {
  const amount = BigInt(amountMinor || "0");
  const decimals = asset === "FIAT_EUR" ? 2n : 6n;
  const scale = 10n ** decimals;
  const whole = amount / scale;
  const fraction = (amount % scale).toString().padStart(Number(decimals), "0").replace(/0+$/, "");
  return `${whole}${fraction ? `.${fraction}` : ""} ${asset}`;
}

async function fetchControls() {
  const response = await fetch("/api/v1/digital-energy/controls", { cache: "no-store" });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.error?.message ?? payload?.error?.code ?? "Institutional controls unavailable");
  return payload as DigitalEnergyApiEnvelope<DigitalEnergyControlsPayload>;
}

async function approveSettlement(input: { id: string; reviewHash: string; decision: "APPROVED" | "REJECTED"; demoUserId?: string }) {
  const response = await fetch(`/api/v1/digital-energy/settlements/${encodeURIComponent(input.id)}/approval`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "idempotency-key": `control_${crypto.randomUUID()}`,
      ...(input.demoUserId ? { "x-user-id": input.demoUserId } : {}),
    },
    body: JSON.stringify({
      approvalId: `approval_${crypto.randomUUID()}`,
      decision: input.decision,
      reviewHash: input.reviewHash,
    }),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload?.error?.message ?? payload?.error?.code ?? "Approval failed");
  return payload;
}

export function InstitutionalControlsWorkspace() {
  const [payload, setPayload] = useState<DigitalEnergyApiEnvelope<DigitalEnergyControlsPayload> | null>(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [demoChecker, setDemoChecker] = useState("checker_demo_1");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPayload(await fetchControls());
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Institutional controls unavailable");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const interval = window.setInterval(() => void load(), 20_000);
    return () => window.clearInterval(interval);
  }, [load]);

  async function decide(id: string, reviewHash: string, decision: "APPROVED" | "REJECTED") {
    setExecuting(`${id}:${decision}`);
    try {
      await approveSettlement({
        id,
        reviewHash,
        decision,
        ...(payload?.meta.dataMode === "DEMO" ? { demoUserId: demoChecker } : {}),
      });
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Approval failed");
    } finally {
      setExecuting(null);
    }
  }

  const data = payload?.data;
  const controls = data?.controls;
  const pending = data?.settlements.filter(item => item.state === "READY" && item.control?.state === "PENDING") ?? [];
  const approved = data?.settlements.filter(item => item.control?.state === "APPROVED") ?? [];
  const rejected = data?.settlements.filter(item => item.control?.state === "REJECTED") ?? [];
  const failedOutbox = data?.outbox.filter(item => item.state === "FAILED") ?? [];

  return (
    <Shell>
      <div className="operations-workspace institutional-controls-workspace">
        <header className="workspace-hero">
          <div>
            <span className="eyebrow">Institutional reliability control plane</span>
            <h1>Review the exact settlement proposal before execution.</h1>
            <p>
              Each financial settlement is bound to a deterministic SHA-256 review hash. Distinct checker approvals,
              maker-checker separation and a transactional outbox gate downstream execution without changing the
              authoritative physical-energy or delivery evidence.
            </p>
          </div>
          <div className="workspace-hero-actions">
            <span>{payload?.meta.dataMode ?? "CHECKING"}</span>
            <button type="button" onClick={() => void load()} disabled={loading}>
              <RefreshCw className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </header>

        {payload?.meta.dataMode === "DEMO" && (
          <section className="dashboard-panel demo-checker-panel">
            <div>
              <span className="eyebrow">DEMO checker identity</span>
              <strong>Demonstrate distinct maker-checker approvals without weakening LIVE authorization.</strong>
            </div>
            <label>
              Checker
              <select value={demoChecker} onChange={event => setDemoChecker(event.target.value)}>
                <option value="checker_demo_1">checker_demo_1</option>
                <option value="checker_demo_2">checker_demo_2</option>
                <option value="checker_demo_3">checker_demo_3</option>
              </select>
            </label>
          </section>
        )}

        {error && (
          <div className="digital-energy-error">
            <ShieldAlert />
            <div><strong>Control-plane notice</strong><span>{error}</span></div>
          </div>
        )}

        <section className="operations-metric-grid institutional-controls-grid">
          <article><UserCheck /><span>Required approvals</span><strong>{controls?.settlementApprovalsRequired ?? "—"}</strong></article>
          <article><Clock3 /><span>Pending approval</span><strong>{pending.length}</strong></article>
          <article><CheckCircle2 /><span>Approved</span><strong>{approved.length}</strong></article>
          <article><XCircle /><span>Rejected</span><strong>{rejected.length}</strong></article>
          <article><Send /><span>Outbox pending</span><strong>{controls?.pendingOutboxEvents ?? 0}</strong></article>
          <article><ShieldCheck /><span>Publisher</span><strong>{data?.publisher.state ?? "UNRESOLVED"}</strong></article>
        </section>

        <section className="dashboard-panel institutional-control-panel">
          <div className="dashboard-card-head">
            <div><span className="eyebrow">Control policy</span><h2>Maker → checker → submit → publish</h2></div>
            <LockKeyhole className="h-5 w-5 text-emerald-700" />
          </div>
          <div className="institutional-control-flow">
            <span><Fingerprint /> SHA-256 review hash</span>
            <span>→</span>
            <span><UserCheck /> {controls?.settlementApprovalsRequired ?? 2} distinct checker(s)</span>
            <span>→</span>
            <span><ShieldCheck /> Maker separated</span>
            <span>→</span>
            <span><Send /> Transactional outbox</span>
          </div>
          <div className="publisher-health-row">
            <span>Publisher runtime</span>
            <strong className={`publisher-health ${String(data?.publisher.state ?? "UNCONFIGURED").toLowerCase()}`}>{data?.publisher.state ?? "UNCONFIGURED"}</strong>
            <small>
              {data?.publisher.state === "OPERATIONAL"
                ? `${data.publisher.published ?? 0} published · ${data.publisher.failed ?? 0} failed`
                : data?.publisher.lastError ?? data?.publisher.reason ?? "Worker health endpoint not configured"}
            </small>
          </div>
          <p className="digital-energy-note">
            Outbox delivery is at-least-once. Downstream consumers must treat the PowerChain event ID as an idempotency key.
            A settlement approval never proves physical delivery; meter evidence and reconciliation remain authoritative.
          </p>
        </section>

        <section className="dashboard-panel">
          <div className="dashboard-card-head">
            <div><span className="eyebrow">Checker queue</span><h2>Settlement proposals awaiting review</h2></div>
            <span className="data-mode-chip live">{pending.length} pending</span>
          </div>
          <div className="settlement-control-list">
            {pending.map(settlement => (
              <article key={settlement.id} className="settlement-control-card">
                <div>
                  <strong>{settlement.id}</strong>
                  <span>{settlementAmount(settlement.asset, settlement.amountMinor)} · {settlement.network}</span>
                </div>
                <dl>
                  <div><dt>Review hash</dt><dd title={settlement.reviewHash}>{shortHash(settlement.reviewHash)}</dd></div>
                  <div><dt>Maker</dt><dd>{settlement.createdBy ?? "—"}</dd></div>
                  <div><dt>Approvals</dt><dd>{settlement.control?.approvedBy.length ?? 0} / {settlement.approvalsRequired ?? controls?.settlementApprovalsRequired ?? 2}</dd></div>
                  <div><dt>Maker/checker</dt><dd>{settlement.control?.makerCheckerSatisfied === false ? "REQUIRES DISTINCT CHECKER" : "ENFORCED"}</dd></div>
                </dl>
                <div className="settlement-control-actions">
                  <button
                    type="button"
                    disabled={!settlement.reviewHash || Boolean(executing)}
                    onClick={() => settlement.reviewHash && void decide(settlement.id, settlement.reviewHash, "APPROVED")}
                  >
                    <CheckCircle2 /> {executing === `${settlement.id}:APPROVED` ? "Approving…" : "Approve exact hash"}
                  </button>
                  <button
                    type="button"
                    className="danger"
                    disabled={!settlement.reviewHash || Boolean(executing)}
                    onClick={() => settlement.reviewHash && void decide(settlement.id, settlement.reviewHash, "REJECTED")}
                  >
                    <XCircle /> {executing === `${settlement.id}:REJECTED` ? "Rejecting…" : "Reject"}
                  </button>
                </div>
              </article>
            ))}
            {!pending.length && <p className="digital-energy-note">No READY settlements are awaiting checker approval.</p>}
          </div>
        </section>

        <section className="dashboard-panel">
          <div className="dashboard-card-head">
            <div><span className="eyebrow">Transactional outbox</span><h2>Downstream event reliability</h2></div>
            <span className={`data-mode-chip ${failedOutbox.length ? "degraded" : "live"}`}>{failedOutbox.length ? `${failedOutbox.length} failed` : "healthy queue"}</span>
          </div>
          <div className="outbox-event-list">
            {(data?.outbox ?? []).slice(0, 30).map(event => (
              <article key={event.id}>
                <span className={`outbox-state ${event.state.toLowerCase()}`}>{event.state}</span>
                <div><strong>{event.topic}</strong><small>{event.aggregateType} · {event.aggregateId}</small></div>
                <div><b>{event.attempts} attempt{event.attempts === 1 ? "" : "s"}</b><small>{event.lastError ?? event.id}</small></div>
              </article>
            ))}
            {!data?.outbox.length && <p className="digital-energy-note">No pending or failed outbox events.</p>}
          </div>
        </section>
      </div>
    </Shell>
  );
}
