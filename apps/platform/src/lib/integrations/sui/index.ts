/**
 * Application-facing Sui integration.
 *
 * Mysten's current SDK no longer exports the legacy JSON-RPC `SuiClient` and
 * `getFullnodeUrl` symbols from `@mysten/sui/client`. The shared adapter keeps
 * transport and signer choices behind one canonical integration contract.
 */
export {
  SuiIntegrationAdapter,
  type SuiTransactionCommand,
  type SuiTransactionEffects,
} from "@powerchain/integration/sui";
