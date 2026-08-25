import type { SVGProps } from "react";

export type PowerChainIconName =
  | "overview" | "energy" | "assets" | "devices" | "grid" | "plant" | "wind"
  | "charging" | "market" | "copilot" | "agents" | "commerce" | "treasury"
  | "organization" | "settings" | "admin" | "map" | "docs" | "api" | "search"
  | "bell" | "menu" | "close" | "status" | "supply" | "wallet" | "arrow"
  | "chevron" | "activity" | "shield" | "clock" | "refresh" | "plus" | "warning";

const paths: Record<PowerChainIconName, string> = {
  overview: "M3 3h7v7H3V3Zm11 0h7v4h-7V3ZM3 14h7v7H3v-7Zm11-3h7v10h-7V11Z",
  energy: "M13.2 2 5 13h6l-.8 9L19 10h-6l.2-8Z",
  assets: "M12 2 3 7l9 5 9-5-9-5Zm-9 9 9 5 9-5M3 15l9 5 9-5",
  devices: "M5 3h14v14H5V3Zm4 18h6M9 7h6M9 11h4",
  grid: "M12 2v20M4 7h16M6 2l-3 20M18 2l3 20M5 15h14",
  plant: "M3 21V9l5 3V8l5 3V5l8 4v12H3Zm4-4h2m4 0h2m4 0h1",
  wind: "M12 12 7 4c4-2 7 1 5 8Zm0 0 9-1c0 4-4 6-9 1Zm0 0-4 8c-4-2-4-7 4-8Zm0 0v10",
  charging: "M8 2h8v8h3l-7 12v-8H8V2Zm3 3v4h3",
  market: "M4 17 9 12l4 3 7-9M17 6h3v3",
  copilot: "M12 2l2.3 6.2L21 10l-6.7 1.8L12 18l-2.3-6.2L3 10l6.7-1.8L12 2Zm7 13 .9 2.6L23 19l-3.1 1.4L19 23l-.9-2.6L15 19l3.1-1.4L19 15Z",
  agents: "M8 9a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8 2a3 3 0 1 0 0-6 3 3 0 0 0 0 0 6ZM2 21v-3a6 6 0 0 1 12 0v3H2Zm13 0v-2a5 5 0 0 1 7-4.6V21h-7Z",
  commerce: "M3 5h18l-2 9H7L5 2H2m6 16a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm9 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z",
  treasury: "M3 9h18v12H3V9Zm2-4h14v4H5V5Zm3 9h8",
  organization: "M4 21V7l8-4 8 4v14H4Zm4-10h2m4 0h2m-8 4h2m4 0h2m-5 6v-3h2v3",
  settings: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm9 4-2.2-1 .2-2.4-2.2-2.2-2.4.2L13.4 4h-2.8l-1 2.6-2.4-.2L5 8.6 5.2 11 3 12l2.2 1-.2 2.4 2.2 2.2 2.4-.2 1 2.6h2.8l1-2.6 2.4.2 2.2-2.2-.2-2.4 2.2-1Z",
  admin: "M12 2 4 5v6c0 5 3.4 9.3 8 11 4.6-1.7 8-6 8-11V5l-8-3Zm0 5v10m-4-5h8",
  map: "m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Zm6-3v15m6-12v15",
  docs: "M5 2h10l4 4v16H5V2Zm10 0v5h4M8 11h8M8 15h8M8 19h5",
  api: "M8 7 3 12l5 5m8-10 5 5-5 5m-2-12-4 14",
  search: "m20 20-4.4-4.4M18 11a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Zm-8 12h4",
  menu: "M4 7h16M4 12h16M4 17h16",
  close: "M5 5l14 14M19 5 5 19",
  status: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm-4 9 2.5 2.5L16 9",
  supply: "M4 6h16v12H4V6Zm4-3v3m8-3v3M8 11h8m-8 4h5",
  wallet: "M3 6h15a3 3 0 0 1 3 3v9H3V6Zm0 0 12-3v3m2 6h4",
  arrow: "M5 12h14m-5-5 5 5-5 5",
  chevron: "m9 18 6-6-6-6",
  activity: "M3 12h4l2-6 4 12 2-6h6",
  shield: "M12 2 4 5v6c0 5 3.4 9.3 8 11 4.6-1.7 8-6 8-11V5l-8-3Zm-3 10 2 2 4-5",
  clock: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 5v5l3 2",
  refresh: "M20 7v5h-5M4 17v-5h5M6.1 8A7 7 0 0 1 18 6l2 6M17.9 16A7 7 0 0 1 6 18l-2-6",
  plus: "M12 5v14M5 12h14",
  warning: "M12 3 2.5 20h19L12 3Zm0 6v5m0 3h.01"
};

export function PowerChainIcon({ name, ...props }: { name: PowerChainIconName } & SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}><path d={paths[name]} /></svg>;
}
