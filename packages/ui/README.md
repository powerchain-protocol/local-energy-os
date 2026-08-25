# @powerchain/ui

Canonical PowerChain v1.0.0 application-shell and UI primitive package.

It provides the shared brand mark, icon system, full-height application sidebar, responsive navigation drawer, top bar, page headers, panels, stat cards, status badges and empty states used across PowerChain applications.

## Design invariants

```text
Full-height sidebar: 100dvh
Application footer: none
Primary palette: white / light gray / forest green / black
Bright green: semantic status only
Physical infrastructure: before blockchain details
```

Import the global design system once from each Next.js application layout:

```ts
import "@powerchain/ui/styles.css";
```

Then wrap the application in `ApplicationShell` with product-specific grouped navigation.
