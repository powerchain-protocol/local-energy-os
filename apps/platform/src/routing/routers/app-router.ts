import { ROUTES } from "@/config/routes";

export interface NavigationRouter {
  push(href: string): void;
  replace?(href: string): void;
}

const SAFE_PATH = /^\/(?!\/)[a-zA-Z0-9/_?=&%.-]*$/;

export function safeRedirectPath(value: unknown, fallback = ROUTES.home) {
  return typeof value === "string" && SAFE_PATH.test(value) && !value.startsWith("//") ? value : fallback;
}

export function routeTo(router: NavigationRouter, path: unknown, fallback = ROUTES.home) {
  router.push(safeRedirectPath(path, fallback));
}

export function routeForRole(role: string) {
  switch (role) {
    case "super-admin":
    case "admin":
      return ROUTES.users;
    case "client":
      return ROUTES.exchange;
    case "company":
      return ROUTES.analytics;
    case "prosumer":
      return ROUTES.energy;
    case "consumer":
    default:
      return ROUTES.home;
  }
}
