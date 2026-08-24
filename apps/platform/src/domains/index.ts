/** Public entry point for the PowerChain domains layer. */
import { PLATFORM_VERSION } from "@/config/release";
export const domainsLayer = {
  id: "domains",
  version: PLATFORM_VERSION,
  status: "active" as const,
};
