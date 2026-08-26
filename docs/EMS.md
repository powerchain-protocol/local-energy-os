# PowerChain Energy Management System (EMS)

**Product:** PowerChain Local Energy OS  
**Version:** 1.0.0  
**Role:** Physical energy operations, forecasting, flexibility and controlled dispatch

## 1. Purpose

The Energy Management System connects real-time physical energy state to forecasting, optimization, dispatch, verification and settlement.

The EMS is not a decorative dashboard. It represents physical generation, demand, storage, grid exchange, constraints, forecasts and flexibility with explicit units, timestamps, source identity and freshness.

Physical energy remains authoritative.

```text
Measure → Normalize → Validate → Observe → Forecast → Simulate → Policy → Approve → Dispatch → Verify → Settle
```

## 2. Navigation

```text
ENERGY MANAGEMENT
├── Overview
├── Live Flow
├── Generation
├── Consumption
├── Storage
├── Forecast
├── Flexibility
├── Dispatch
├── Grid
├── Markets
└── Events
```

The authenticated PowerChain application retains the full-height navigation shell and no application footer.

## 3. Information hierarchy

Every EMS screen follows this order:

1. physical state;
2. source timestamp and freshness;
3. operating constraints;
4. forecast or derived flexibility;
5. action safety and approval;
6. verification and evidence;
7. settlement/protocol details.

Blockchain and payment rails are secondary. They must never displace generation, demand, storage or grid state as the primary operational information.

## 4. Operational states

| Domain | Examples | Required metadata |
| --- | --- | --- |
| Generation | Solar, wind, hydro, CHP | kW/MW, source, timestamp, quality |
| Demand | Site load, facility demand | kW/MW, interval energy, timestamp, confidence |
| Storage | SOC, charge/discharge, availability | SOC %, kW/MW, kWh/MWh, temperature, cycle state |
| Grid | Import/export, limits, outages | kW/MW, connection point, constraint, timestamp |
| Forecast | Generation, demand, SOC, grid | horizon, resolution, value, confidence, model/version |
| Flexibility | Load shift, battery, EV, curtailment | direction, capacity, energy, window, duration, constraints |
| Dispatch | Controller action | asset, target, setpoint, simulation, approval, execution, verification |

## 5. Units

Power and energy are visually and semantically distinct.

```text
Instantaneous / operating state
kW, MW

Interval / accumulated physical energy
Wh, kWh, MWh, GWh

Storage state
SOC % + kW/MW + kWh/MWh
```

A verified Energy Batch in Wh must never be reverse-converted into a live kW reading.

## 6. Freshness

Canonical EMS presentation states:

```text
LIVE
FRESH
STALE
RECONNECTING
DEGRADED
OFFLINE
SIMULATED
UNCONFIGURED
```

Every operational value should include:

- observed/source timestamp;
- received timestamp where relevant;
- source identity;
- unit;
- quality/confidence;
- freshness state.

The interface must never display stale or simulated data as live.

## 7. Overview UX

The EMS Overview answers:

```text
What is generating now?
What is consuming now?
What is storage doing?
What is flowing to/from the grid?
Is the data fresh?
What is forecast next?
What flexibility exists?
Is dispatch currently allowed?
What verified energy evidence exists?
```

The top row is reserved for live physical state. If telemetry is not connected, those metrics display `—` and `UNCONFIGURED`, not derived approximations.

Settlement-grade Energy Batch data appears in a separate **Verified Energy** section.

## 8. Live Flow UX

```text
Generation ───────→ Site Bus ───────→ Demand
                         │
                         ├───────────→ Storage
                         │
                         └───────────→ Grid
```

Each node shows:

- current value;
- unit;
- direction where applicable;
- freshness;
- source timestamp;
- source identity.

The flow diagram is not rendered as LIVE unless the contributing values are synchronized within configured freshness limits.

## 9. Generation

The Generation page separates:

```text
LIVE GENERATION
kW / MW telemetry

VERIFIED GENERATION
Wh / kWh / MWh evidence
```

The current scaffold exposes verified Energy Batches. Live generation remains unconfigured until a meter, inverter, SCADA or plant-control integration is connected.

## 10. Consumption

Consumption requires meter/BMS/SCADA/utility interval evidence with:

- current demand;
- interval energy;
- source timestamp;
- interval boundaries;
- quality/confidence;
- meter/source identity.

## 11. Storage

Storage must show at least:

```text
SOC
Charge/discharge power
Available energy
Operating mode
Availability
Temperature
Constraints
```

A battery does not create renewable provenance. Source lots and storage losses remain separate concerns from state-of-charge presentation.

## 12. Forecast

Forecast UX separates forecast output from actual measured state.

Every forecast includes:

- generated-at time;
- horizon;
- resolution;
- model/provider/version;
- confidence/prediction interval;
- input freshness.

Forecast data is never marked LIVE.

## 13. Flexibility

Flexibility is an available capability, not a dispatch command.

Examples:

- increase/decrease load;
- increase/decrease export;
- battery charge/discharge;
- EV charging shift;
- V2G;
- curtailment;
- demand response.

A flexibility position requires capacity, direction, time window, duration and constraints.

## 14. Dispatch safety

```text
Context
  ↓
Simulation
  ↓
Policy
  ↓
Approval
  ↓
Execution
  ↓
Verification
```

No physical action bypasses these stages.

Dispatch controls must show:

- asset/controller target;
- requested setpoint;
- duration;
- simulation result;
- policy result;
- approval requirement;
- execution status;
- post-action telemetry verification;
- audit/correlation identity.

Public blockchain services never connect directly to PLC/BMS/SCADA controllers.

## 15. Grid

Grid UX separates configured topology from live grid state.

```text
Grid Area
→ Substation
→ Transformer
→ Feeder
→ Connection Point
→ Energy Site
```

Live grid state adds import/export, limits, outages, congestion and constraints only when a grid-operator or telemetry source is connected.

## 16. Markets

Market state remains separate from physical delivery.

```text
Energy Position
→ Reservation
→ Market commitment
→ Delivery
→ Meter verification
→ Settlement
→ Reconciliation
```

A reservation is not proof of delivery or payment.

## 17. Events

EMS events preserve:

```text
eventId
source
sequence
observedAt
receivedAt
correlationId
payload version
quality/freshness
```

WebSocket/gRPC transport availability is not equivalent to physical telemetry availability.

## 18. Responsive design

### Desktop

- full-height persistent sidebar;
- sticky application top bar;
- four-column live metrics;
- primary flow canvas + secondary freshness panel;
- dense but readable operational tables.

### Tablet

- two-column metrics;
- simplified flow layout;
- safety rail wraps to three columns.

### Mobile

- single-column operational state;
- stacked flow nodes;
- five-part PowerChain mobile dock;
- no footer;
- critical freshness/constraint state remains visible before secondary metadata.

## 19. Design rule

> If PowerChain cannot establish the physical source, unit, timestamp and freshness of an EMS value, the interface must display it as unavailable rather than plausible.

## Canonical operational information architecture

The Energy application preserves `/` as the operational Overview entry and separates detailed work by decision purpose:

```text
/
└── Overview

/monitor
├── /monitor/live-flow
├── /monitor/generation
├── /monitor/consumption
└── /monitor/storage

/operate
├── /operate/forecast
├── /operate/flexibility
├── /operate/dispatch
└── /operate/grid

/context
├── /context/markets
└── /context/events
```

The three workspaces have intentionally different responsibilities:

- **Monitor** — authoritative physical state and evidence. Values require engineering units, source identity, observation/receive timestamps, freshness and quality.
- **Plan & Operate** — forecasts, flexibility, grid constraints and safe-action preparation. Planning is not physical execution; dispatch remains `Context → Simulate → Policy → Approve → Execute → Verify`.
- **Context** — markets, events and external-system evidence. Context can explain, price or correlate physical state, but cannot replace telemetry or verification.

Legacy `/energy/*` routes remain as compatibility redirects to the canonical URLs. This preserves existing bookmarks while preventing duplicate navigation and competing canonical paths.

Each operational workspace uses a shared responsive section navigation. Desktop shows purpose-specific subnavigation in the operational context bar; tablet and mobile reflow the navigation into two-column and one-column layouts without horizontal scrolling.
