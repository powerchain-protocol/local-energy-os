/** Public entry point for the PowerChain experience layer. */
import { PLATFORM_VERSION } from "@/config/release";
export const experienceLayer = {
  id: "experience",
  version: PLATFORM_VERSION,
  status: "active" as const,
};
