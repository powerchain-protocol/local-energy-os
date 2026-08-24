/**
 * Application-facing Helius integration.
 *
 * The upstream `helius-sdk` package no longer exposes the legacy `Helius`
 * class. Keep the platform on PowerChain's stable adapter boundary instead of
 * leaking a vendor API into application code.
 */
export {
  HeliusAdapter,
  type HeliusAdapterRequest,
  type HeliusAdapterResponse,
} from "@powerchain/integration/web3/helius";
