import { NextResponse } from "next/server";
import { getLiveActivity } from "@/lib/live";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ type: string; id: string }> }) {
  const { type, id } = await params;
  const live = await getLiveActivity(Number(type), id);
  return NextResponse.json(live, { headers: { "Cache-Control": "no-store" } });
}
