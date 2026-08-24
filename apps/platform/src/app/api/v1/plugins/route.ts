import { NextResponse } from "next/server"; import { listPlugins } from "@/lib/plugins/registry";
export async function GET(){return NextResponse.json({data:listPlugins()});}
