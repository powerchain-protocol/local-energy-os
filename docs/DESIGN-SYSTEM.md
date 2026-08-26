# PowerChain Brand System & UI/UX Design System

**Version:** 1.0.0  
**Scope:** Local Energy OS, Renewable RWA, DePIN/IoT, Machine Economy, ACP Commerce, PowerChain Copilot, SaaS Platform and developer tooling.

## Positioning

PowerChain should feel like a modern energy-infrastructure operating system: industrial, trustworthy, technical, financial, sustainable, premium and calm. The design deliberately avoids generic crypto aesthetics, neon green, cyberpunk gradients, excessive glassmorphism, glowing blockchain motifs and dense “dashboard overload”.

The visual hierarchy is always:

```text
Physical infrastructure
→ operational state
→ verified energy / asset state
→ financial state
→ blockchain / protocol details when relevant
```

## Canonical colors

| Token | Value | Purpose |
| --- | --- | --- |
| `--pc-white` | `#FFFFFF` | Primary surface |
| `--pc-background` | `#F6F7F6` | App background |
| `--pc-surface-muted` | `#EEF1EE` | Secondary surface |
| `--pc-border` | `#D9DEDA` | Borders |
| `--pc-ink` | `#101513` | Primary text |
| `--pc-muted` | `#66706A` | Secondary text |
| `--pc-forest` | `#143C2E` | Brand anchor |
| `--pc-green` | `#1E6B4B` | Interactive/verified accent |
| `--pc-green-soft` | `#E7F1EB` | Active navigation/background |

Status colors are reserved for semantic status and must never become the dominant brand palette.

## Application shell

All operational applications use `@powerchain/ui` and the canonical `ApplicationShell`.

### Desktop rules

- Sidebar is fixed to the viewport and uses `height: 100dvh`.
- Sidebar content scrolls independently from the application stage.
- There is **no application footer**.
- The top bar remains sticky inside the main stage.
- Navigation is grouped into `WORKSPACE`, `INTELLIGENCE`, `ECONOMY`, and `SYSTEM` or domain-specific equivalents.
- Blockchain networks and payment rails are secondary metadata, not the primary visual hierarchy.

### Mobile rules

The desktop sidebar becomes a focusable drawer with an overlay, Escape-to-close behavior and body scroll locking. Main content remains usable without relying on hover interactions.

## Typography

Primary UI typography is Inter/system sans. Headings use tighter tracking and restrained weight. The brand lockup uses a heavier `Power` and lighter `Chain` treatment without redesigning the mark for each product.

## Components

Canonical shared components include:

```text
ApplicationShell
PowerChainBrand
PowerChainIcon
PageHeader
StatCard
Panel
StatusBadge
EmptyState
```

Product-specific components should build on these primitives instead of recreating shells, cards or navigation styling inside each app.

## Card and surface rules

- Use borders, spacing and typography before shadows.
- Shadows remain subtle.
- Avoid nested card-on-card layouts unless hierarchy requires them.
- Empty and unavailable states are preferred over fabricated demo metrics.
- Verified/live states use restrained green only when the underlying source actually supports that state.

## UX safety principles

Financial or external actions must disclose destination, maximum amount, network/rail, fees and approval requirements before execution. Copilot and agents must expose context, generation, verification/evidence and action stages. UI visibility never replaces backend authorization.

## Footer policy

Authenticated PowerChain applications and the documentation shell do not render a footer. Product/version and runtime identity belong in navigation/header metadata or dedicated system surfaces, keeping the full-height sidebar continuous from top to bottom.
