import { NextResponse } from "next/server";
import { getSignatureStatus } from "@/solana/solana";
import { signatureSchema } from "@/types/validate";

export async function GET(request: Request) {
  try {
    const signature = signatureSchema.parse(new URL(request.url).searchParams.get("signature"));
    const data = await getSignatureStatus(signature);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Invalid signature" },
      { status: 400 },
    );
  }
}
