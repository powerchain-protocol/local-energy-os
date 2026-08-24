/** Server-side compatibility export. Client components must import from `@/env/client`. */
export { serverEnv as env } from "./server";
export { serverEnv } from "./server";
export { clientEnv } from "./client";
export type { ClientEnvironment, ServerEnvironment } from "./schema";
