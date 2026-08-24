import { NextResponse } from "next/server";
import { conformanceProfiles, governanceBodies, publicationLifecycle, standardsPublications } from "@/data/standards";

export function GET() {
  return NextResponse.json({ program: "PowerChain Technical Standards Program", acronym: "PTSP", version: "5.0-draft", status: "foundational-program", publisher: "PowerChain Foundation", publications: standardsPublications, profiles: conformanceProfiles, governance: governanceBodies, lifecycle: publicationLifecycle });
}
