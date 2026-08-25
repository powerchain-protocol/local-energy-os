import type { SystemOverallState, SystemServiceStatus } from "./types/status";

const unavailableCritical = (service: SystemServiceStatus) =>
  service.critical && ["UNAVAILABLE", "UNCONFIGURED"].includes(service.state);

export function resolveOverallState(services: SystemServiceStatus[]): SystemOverallState {
  if (services.some(service => service.critical && service.state === "MAINTENANCE")) return "MAINTENANCE";
  if (services.some(unavailableCritical)) return "UNAVAILABLE";
  if (services.some(service => ["DEGRADED", "DELAYED", "UNAVAILABLE", "UNCONFIGURED"].includes(service.state))) return "DEGRADED";
  return "OPERATIONAL";
}
