export interface Coordinate { latitude: number; longitude: number }
export interface Waypoint extends Coordinate { id: string; label: string; kind: "asset" | "meter" | "charger" | "gateway" | "substation" }
export interface RouteEstimate { distanceKm: number; estimatedMinutes: number; waypoints: Waypoint[] }
const EARTH_RADIUS_KM = 6371;
const radians = (value: number) => value * Math.PI / 180;
export function distanceKm(a: Coordinate, b: Coordinate): number {
  const dLat = radians(b.latitude - a.latitude); const dLon = radians(b.longitude - a.longitude);
  const lat1 = radians(a.latitude); const lat2 = radians(b.latitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}
export function buildWayfinderRoute(waypoints: Waypoint[], averageKph = 55): RouteEstimate {
  const distance = waypoints.slice(1).reduce((sum, point, index) => sum + distanceKm(waypoints[index], point), 0);
  return { distanceKm: Math.round(distance * 10) / 10, estimatedMinutes: Math.ceil(distance / averageKph * 60), waypoints };
}
export function searchWaypoints(waypoints: Waypoint[], query: string): Waypoint[] {
  const term = query.trim().toLowerCase(); return term ? waypoints.filter(item => `${item.label} ${item.kind}`.toLowerCase().includes(term)) : waypoints;
}
