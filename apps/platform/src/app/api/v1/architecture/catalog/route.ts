import { NextResponse } from "next/server";
import { architectureLayers, standardsCatalog } from "@/data/architecture";

export function GET() {
  return NextResponse.json({ framework: "PowerChain Platform Architecture", version: "3.0-draft", status: "architecture-framework", publisher: "PowerChain Foundation", layers: architectureLayers, standards: standardsCatalog, traceability: ["principle", "requirement", "capability", "reference-model", "protocol", "schema", "implementation", "conformance-test"] });
}
