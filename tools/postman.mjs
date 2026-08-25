import { spawnSync } from "node:child_process";

const action = process.argv[2] ?? "doctor";
const apiKey = process.env.POSTMAN_API_KEY?.trim();
const workspace = process.env.POSTMAN_WORKSPACE_ID?.trim();
const collection = process.env.POSTMAN_COLLECTION_UID?.trim();
const environment = process.env.POSTMAN_ENVIRONMENT_UID?.trim();
const monitorCollection = process.env.POSTMAN_MONITOR_COLLECTION_UID?.trim() || collection;
const base = process.env.POSTMAN_API_BASE_URL?.trim() || "https://api.getpostman.com";

function missing(...pairs) {
  const names = pairs.filter(([,value]) => !value).map(([name]) => name);
  if (names.length) { console.error(`[PowerChain Postman] Missing ${names.join(", ")}.`); process.exit(1); }
}
async function post(path, body) {
  missing(["POSTMAN_API_KEY", apiKey], ["POSTMAN_WORKSPACE_ID", workspace]);
  const response = await fetch(`${base}${path}${path.includes("?") ? "&" : "?"}workspace=${encodeURIComponent(workspace)}`, {
    method: "POST", headers: { "content-type": "application/json", "x-api-key": apiKey }, body: JSON.stringify(body)
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`Postman ${response.status}: ${text}`);
  console.log(text);
}
function cli(args) {
  const result = spawnSync("postman", args, { stdio: "inherit" });
  if (result.error?.code === "ENOENT") { console.error("Postman CLI is not installed. Install/login to Postman CLI before this action."); process.exit(1); }
  process.exit(result.status ?? 1);
}

switch (action) {
  case "doctor":
    console.log(JSON.stringify({ status: apiKey && workspace ? "ready" : "configuration-required", workspace: workspace ? "configured" : "missing", collection: collection ? "configured" : "missing", environment: environment ? "configured" : "optional", apiKey: apiKey ? "configured" : "missing" }, null, 2));
    break;
  case "mock:create":
    missing(["POSTMAN_COLLECTION_UID", collection]);
    await post("/mocks", { mock: { name: "PowerChain Local Energy OS Mock", collection, ...(environment ? { environment } : {}), private: true } });
    break;
  case "monitor:create":
    missing(["POSTMAN_MONITOR_COLLECTION_UID or POSTMAN_COLLECTION_UID", monitorCollection]);
    await post("/monitors", { monitor: { name: "PowerChain API Health", collection: monitorCollection, ...(environment ? { environment } : {}), schedule: { cron: "*/30 * * * *", timezone: "Europe/Helsinki" } } });
    break;
  case "webhook:create":
    missing(["POSTMAN_WORKSPACE_ID", workspace]);
    cli(["webhook", "create", "--title", "PowerChain API Verification", "--workspace", workspace]);
    break;
  case "flow:deploy": {
    const flow = process.env.POSTMAN_FLOW_ID?.trim();
    missing(["POSTMAN_FLOW_ID", flow]);
    cli(["flows", "deploy", flow, "--path", process.env.POSTMAN_FLOW_PATH?.trim() || "powerchain-api-health"]);
    break;
  }
  default:
    console.error(`Unknown Postman action: ${action}`); process.exit(1);
}
