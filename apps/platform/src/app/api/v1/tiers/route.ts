import { NextResponse } from "next/server";import { tiers } from "@/data/tiers";export async function GET(){return NextResponse.json({data:tiers,meta:{count:tiers.length}})}
