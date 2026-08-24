import { prometheus } from "@/lib/observability/metrics";
export async function GET(){return new Response(prometheus() || "# PowerChain metrics\npowerchain_up 1\n",{headers:{"Content-Type":"text/plain; version=0.0.4"}});}
