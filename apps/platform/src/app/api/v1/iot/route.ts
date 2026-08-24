import { NextResponse } from "next/server";

export async function GET() {
  const timestamp = new Date().toISOString();
  return NextResponse.json({
    fallback: true,
    readings: [
      { deviceId: "SM-HEL-0042", metric: "active power", value: 7.84, unit: "kW", timestamp, quality: "good" },
      { deviceId: "SM-SG-1190", metric: "exported energy", value: 32.1, unit: "kWh", timestamp, quality: "good" },
      { deviceId: "EV-BER-021", metric: "charger load", value: 118, unit: "kW", timestamp, quality: "estimated" },
      { deviceId: "LORA-BR-4402", metric: "gateway uplinks", value: 284, unit: "/h", timestamp, quality: "good" },
    ],
  });
}
