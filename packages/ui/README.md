# @powerchain/ui

Canonical PowerChain v1.0.0 application shell and UI primitive package.

The UI layer is designed to make PowerChain feel like one industrial energy infrastructure operating system across Energy, Grid, Plants, Wind, Charging, Supply Chain, SaaS Platform, Admin, Mapper, Docs and API surfaces.

## Shell invariants

```text
Desktop sidebar    fixed / 100dvh
Application footer none
Primary palette    white / light gray / forest green / ink
Bright green       semantic status only
Primary hierarchy physical operations before blockchain rails
```

## Interaction system

- `⌘K` / `Ctrl+K` opens the PowerChain command palette.
- `/` opens command search outside form controls.
- Escape closes command and navigation overlays.
- Active navigation is derived from the current route unless explicitly overridden.
- Mobile uses a compact PowerChain action dock rather than shrinking the desktop sidebar pattern.
- Loading, warning, error and empty states use shared components.

## Components

```text
ApplicationShell
CommandPalette
PowerChainBrand
PowerChainIcon
PageHeader
SectionHeader
StatCard
Panel
StatusBadge
InlineNotice
Skeleton
ProgressBar
LifecycleStep
ActionCard
EmptyState
```

Import the design system once from each Next.js application layout:

```ts
import "@powerchain/ui/styles.css";
```

Then wrap the product application with `ApplicationShell` and grouped product-specific navigation.
