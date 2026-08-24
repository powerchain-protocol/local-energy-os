import { NextResponse } from "next/server";
import { architectureProfiles, capabilityOwners, ecosystemMetrics, frameworkGraph, frameworkPrograms } from "@/data/framework";

export async function GET() {
  return NextResponse.json({
    framework: { name: "PowerChain Engineering Framework", version: "1.0", status: "draft", publisher: "PowerChain Foundation" },
    programs: frameworkPrograms,
    profiles: architectureProfiles,
    capabilityOwners,
    metrics: ecosystemMetrics,
    knowledgeGraph: frameworkGraph,
  });
}
