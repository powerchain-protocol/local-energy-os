export type ActionStatus = "idle" | "pending" | "success" | "error";

export interface ActionResult<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface PlatformAction {
  id: string;
  label: string;
  description: string;
  category: "navigation" | "operations" | "ai" | "wallet";
  href?: string;
  shortcut?: string;
}
