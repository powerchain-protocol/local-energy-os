import type { Request, Response } from "express";
export function requiredQuery(req: Request, name: string): string {
  const value = typeof req.query[name] === "string" ? req.query[name].trim() : "";
  if (!value) throw Object.assign(new Error(`${name} is required`), { code: "INVALID_REQUEST", status: 400, details: { field: name } });
  return value;
}
export function operationalSuccess(res: Response, data: unknown, status = 200) {
  return res.status(status).json({ data, meta: { requestId: res.locals.requestId, generatedAt: new Date().toISOString() } });
}
