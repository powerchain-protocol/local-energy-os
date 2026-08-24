import { NextResponse } from "next/server";
import { profileUpdateSchema } from "@/schemas/profile";
import { getSession } from "@/lib/auth/sessions";
import { errorPayload } from "@/utils/errors";
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json(errorPayload(new Error("Authentication required")), { status: 401 });
  return NextResponse.json({ profile: session.user });
}
export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json(errorPayload(new Error("Authentication required")), { status: 401 });
  const input = profileUpdateSchema.safeParse(await request.json());
  if (!input.success) return NextResponse.json({ error: { code: "VALIDATION_ERROR", message: "Invalid profile data", details: input.error.flatten() } }, { status: 400 });
  return NextResponse.json({ profile: { ...session.user, ...input.data }, persisted: false, mode: "demo" });
}
