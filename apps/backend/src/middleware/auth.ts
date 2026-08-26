import type { NextFunction, Request, Response } from "express";
import type { OperationsAuthAdapter, OperationsIdentity } from "@powerchain/adapters";

function headerMap(req: Request): Record<string, string | undefined> {
  const values: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(req.headers)) values[key.toLowerCase()] = Array.isArray(value) ? value[0] : value;
  return values;
}

export function requireOperationsIdentity(adapter: OperationsAuthAdapter) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const identity = await adapter.authenticate({ authorization: req.header("authorization") ?? undefined, headers: headerMap(req) });
      if (!identity) return res.status(401).json({ error: { code: "AUTH_REQUIRED", message: "Authenticated operational identity is required" } });
      res.locals.operationsIdentity = identity;
      next();
    } catch (error) { next(error); }
  };
}

export function operationsIdentity(res: Response): OperationsIdentity {
  const identity = res.locals.operationsIdentity as OperationsIdentity | undefined;
  if (!identity) throw Object.assign(new Error("AUTH_REQUIRED"), { status: 401, code: "AUTH_REQUIRED" });
  return identity;
}
