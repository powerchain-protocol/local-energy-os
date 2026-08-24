/** Public entry point for the PowerChain operations layer. */
import { PLATFORM_VERSION } from "@/config/release";
export const operationsLayer = {
  id: "operations",
  version: PLATFORM_VERSION,
  status: "active" as const,
};
