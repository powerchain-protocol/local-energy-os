/** Public entry point for the PowerChain intelligence layer. */
import { PLATFORM_VERSION } from "@/config/release";
export const intelligenceLayer = {
  id: "intelligence",
  version: PLATFORM_VERSION,
  status: "active" as const,
};
