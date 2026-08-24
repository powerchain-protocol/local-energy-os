import pino from "pino";

const isDevelopment = process.env.NODE_ENV !== "production";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (isDevelopment ? "debug" : "info"),
  redact: {
    paths: ["req.headers.authorization", "apiKey", "serviceRoleKey", "password", "token"],
    censor: "[REDACTED]"
  },
  transport: isDevelopment
    ? {
        target: "pino-pretty",
        options: { colorize: true, singleLine: true, translateTime: "SYS:standard" }
      }
    : undefined
});
