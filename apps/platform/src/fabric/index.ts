/** Public entry point for the PowerChain fabric layer. */
import { PLATFORM_VERSION } from "@/config/release";
export const fabricLayer = {
  id: "fabric",
  version: PLATFORM_VERSION,
  status: "active" as const,
};
