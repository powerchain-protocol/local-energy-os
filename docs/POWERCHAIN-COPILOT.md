# PowerChain Copilot — Renewable RWA AI Agent System

Version **1.0.0**

## Product definition

**Copilot is the interface. Agents are the workforce. Skills are the capabilities. The RWA Orchestrator coordinates execution.**

PowerChain Copilot is the unified AI operating interface for PowerChain Digital Energy OS, Energy RWA, renewable infrastructure, treasury, funding, documents and operator workflows.

```text
POWERCHAIN COPILOT
       │
       ├── Ask
       ├── Analyze
       ├── Research
       └── Act
       │
       ▼
RWA ORCHESTRATOR
       │
       ├── Asset Researcher
       ├── Asset Analyst
       ├── Risk Agent
       ├── Capital Agent
       ├── Operator Agent
       ├── Verification Agent
       ├── Document Intelligence Agent
       ├── Reporting Agent
       ├── Impact Agent
       └── Launch Agent
       │
       ▼
REUSABLE SKILLS
       │
       ▼
ACTION CENTER
       │
       ▼
HUMAN APPROVAL
       │
       ▼
WALLET SIGNATURE, IF REQUIRED
```


## Architecture workspace

Canonical route:

```text
/copilot/architecture
```

Canonical public diagram:

```text
/public/images/architectures/powerchain-copilot-architecture.png
```

The architecture workspace renders the same source asset used by the root README and explains four distinct boundaries:

```text
INTERFACE
PowerChain Copilot

COORDINATION
RWA Orchestrator

WORKFORCE + CAPABILITIES
Agents + Skills

CONTROL
Action Center → Human Approval → External Wallet Signature
```

The page also makes source-of-truth separation explicit:

```text
Physical Energy → meters / telemetry / evidence / Energy Ledger
Energy RWA      → PET-20 / backing / reservations / retirement
Financial       → settlement controls / treasury / accounting
Networks        → Solana / Sui / explorers / transaction references
```

Copilot coordinates these domains but does not become another ledger or authority source.

## Global operator interface

Copilot is rendered globally inside the authenticated PowerChain shell.

The header exposes a dedicated **Copilot** control. The drawer can also be opened with:

```text
Cmd/Ctrl + I
```

The current route automatically becomes Copilot context.

Examples:

```text
/projects/:id       → PROJECT
/digital-twins/:id  → DIGITAL_TWIN
/energy-rwa         → ENERGY_RWA
/portfolio          → PORTFOLIO
/wallet             → TREASURY
/crowdfunding       → FUNDING_ROUND
/docs               → DOCUMENT
/digital-energy     → WORKSPACE
```

The operator can add explicit structured context such as:

```text
@Asset
@Portfolio
@Treasury
@Documents
```

## Modes

```text
ASK       → Answer
ANALYZE   → Evidence + insight
RESEARCH  → Sources + findings
ACT       → Draft action for approval
```

`ACT` never means autonomous financial execution.

## RWA Orchestrator

`@powerchain/copilot` provides the canonical orchestrator.

Responsibilities:

1. normalize the operator request;
2. resolve minimum relevant context;
3. select specialist agents;
4. select reusable skills;
5. create an execution plan;
6. expose the plan to the operator;
7. coordinate model execution through the AI gateway;
8. prepare a reviewable action when requested;
9. route the action to the Action Center;
10. preserve human/wallet control boundaries.

## Core agents

| Agent | Purpose |
|---|---|
| Asset Researcher | External/internal renewable infrastructure research |
| Asset Analyst | Production, forecasts, capacity and performance |
| Risk Agent | Anomalies, exposures, verification and missing information |
| Capital Agent | Funding, treasury, distributions and settlement analysis |
| Operator Agent | Tasks, workflows, SOPs and reviewable actions |
| Verification Agent | Asset, document, provenance and chain-reference verification |
| Document Intelligence Agent | Document summary, comparison and inconsistency detection |
| Reporting Agent | Asset, portfolio, treasury, funding and impact report drafts |
| Impact Agent | Energy and environmental impact analysis |
| Launch Agent | Launch readiness, allocations, participation and reports |

## Skills

Canonical skills:

```text
asset-analysis
forecast-analysis
anomaly-detection
market-research
document-analysis
rwa-verification
treasury-analysis
funding-analysis
report-generation
workflow-planning
impact-calculation
```

Skills define the reusable capability and permission surface. Agents compose skills rather than embedding every capability independently.

## Context hierarchy

```text
POWERCHAIN COMPANY OS
├── Brand
├── Products
├── Business Rules
├── Policies
├── Organization
└── Operating Principles
          ↓
RENEWABLE RWA CONTEXT
├── Assets
├── Projects
├── Funding Rounds
├── Documents
├── Treasury
├── Energy Data
└── Risk Rules
          ↓
AGENT-SCOPED CONTEXT
```

Agents should receive only the context needed for their assigned step.

## Action Center

Canonical route:

```text
/copilot/action-center
```

A Copilot `ACT` request creates a reviewable draft.

State model:

```text
DRAFT
  ↓
REVIEW_REQUIRED
  ├── REJECTED
  └── APPROVED
        ├── RECORDED
        └── AWAITING_WALLET
               ↓
        SIGNED_EXTERNALLY
               ↓
            RECORDED
```

The Copilot package does not sign wallet transactions.

## Approval chain

```text
READ
↓
ANALYZE
↓
DRAFT
↓
RECOMMEND
↓
REQUEST APPROVAL
↓
HUMAN APPROVES
↓
WALLET SIGNS
```

Non-negotiable rules:

- AI cannot silently move funds.
- AI cannot silently alter critical asset records.
- AI cannot sign a transaction.
- High-impact actions require explicit approval.
- Wallet signatures remain external human actions.
- Model output must not invent telemetry, prices, balances, evidence, hashes, signatures or settlement state.

## API

```text
GET  /api/v1/copilot/registry
POST /api/v1/copilot/plan
POST /api/v1/copilot/run

GET  /api/v1/copilot/actions
POST /api/v1/copilot/actions/:id/approve
POST /api/v1/copilot/actions/:id/reject
POST /api/v1/copilot/actions/:id/wallet-signature
```

Compatibility AI routes remain available where needed but identify Copilot as the canonical interface.

## Product message

# PowerChain Copilot

### Your Renewable RWA operating intelligence.

**Ask naturally. Agents do the analysis. Skills execute the work. You stay in control.**


## External wallet completion

For actions that require a wallet, human approval moves the record to:

```text
AWAITING_WALLET
```

Copilot does not create the signature. After the operator signs through the appropriate wallet or transaction workflow, the external signature/transaction reference can be recorded:

```text
POST /api/v1/copilot/actions/:id/wallet-signature
```

The Action Center then records:

```text
AWAITING_WALLET
→ SIGNED_EXTERNALLY
→ RECORDED
```

Recording a blockchain reference does not prove physical energy delivery.
