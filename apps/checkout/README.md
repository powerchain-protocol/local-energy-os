# PowerChain Checkout

Non-custodial checkout service on port `3102`. Routes cover session creation,
review, wallet approval, signature submission, verified confirmation, and
cancellation. Amounts use integer minor units; the service never signs.

Run with `pnpm --filter @powerchain/checkout-app dev`.
