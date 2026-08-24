import { NextResponse } from "next/server";
import { COPILOT_AGENTS } from "@powerchain/copilot";

export async function GET(){
  return NextResponse.json(
    {data:COPILOT_AGENTS,meta:{canonicalEndpoint:"/api/v1/copilot/registry",deprecatedCompatibilityEndpoint:true}},
    {headers:{"Cache-Control":"no-store","Deprecation":"true"}},
  );
}
