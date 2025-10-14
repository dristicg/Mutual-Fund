
import { NextResponse } from "next/server";
import { fetchScheme } from "@/lib/mfapi.js";
import { computeSip } from "@/lib/sip.js";

export async function POST(req, { params }) {
  const { code } = await params;
  const body = await req.json();
  const { amount, frequency, from, to } = body;

  if (!amount || !from || !to) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const { navHistory } = await fetchScheme(code);
  if (!navHistory.length) {
    return NextResponse.json({ error: "No NAV data" }, { status: 400 });
  }

  const result = computeSip(navHistory, { amount, frequency, from, to });
  return NextResponse.json(result);
}
