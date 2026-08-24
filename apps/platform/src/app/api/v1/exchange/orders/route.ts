import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createExchangeOrder, listOrganizationOrders } from "@/energy/exchange";

const orderSchema = z.object({
  organizationId: z.string().min(1),
  commodity: z.enum(["SOLAR_MWH", "WIND_MWH", "HYDRO_MWH", "REC", "CRT"]),
  side: z.enum(["buy", "sell"]),
  quantity: z.number().positive(),
  limitPrice: z.number().positive(),
  currency: z.enum(["USD", "USDC", "PWRC"]),
});

export async function GET(request: NextRequest) {
  const organizationId = request.nextUrl.searchParams.get("organizationId") ?? "org_demo";
  return NextResponse.json({ orders: listOrganizationOrders(organizationId) });
}

export async function POST(request: NextRequest) {
  const parsed = orderSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_order", issues: parsed.error.flatten() }, { status: 400 });
  }
  return NextResponse.json({ order: createExchangeOrder(parsed.data) }, { status: 201 });
}
