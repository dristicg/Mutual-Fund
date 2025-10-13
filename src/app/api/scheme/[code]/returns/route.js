import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { code } = await params;
  const { searchParams } = req.nextUrl;
  const periodParam = searchParams.get("period"); // "1m" | "3m" | "6m" | "1y" or comma-separated

  try {
    const res = await fetch(`https://api.mfapi.in/mf/${code}`);
    if (!res.ok) {
        throw new Error(`Failed to fetch scheme data from API: ${res.statusText}`);
    }
    const scheme = await res.json();

    if (!scheme.data || scheme.data.length === 0) {
        return NextResponse.json({ error: "No NAV data available for this scheme." }, { status: 404 });
    }

    const navData = scheme.data.map((d) => ({
      date: d.date,
      nav: parseFloat(d.nav),
    })).filter(d => !isNaN(d.nav) && d.nav > 0);

    if (navData.length === 0) {
        return NextResponse.json({ error: "No valid NAV data found." }, { status: 404 });
    }

    const parseDate = (dateStr) => new Date(dateStr.split("-").reverse().join("-"));
    const endDateEntry = navData[0];
    const endDate = parseDate(endDateEntry.date);
    const endNAV = endDateEntry.nav;

    // Handle multiple periods
    const periods = periodParam ? periodParam.split(',') : ['1y'];
    const returns = {};

    for (const period of periods) {
      let startDate = new Date(endDate);
      switch (period.trim()) {
        case "1d":
          startDate.setDate(startDate.getDate() - 1);
          break;
        case "1m":
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case "3m":
          startDate.setMonth(startDate.getMonth() - 3);
          break;
        case "6m":
          startDate.setMonth(startDate.getMonth() - 6);
          break;
        case "1y":
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate = parseDate(navData[navData.length - 1].date);
      }

      const startEntry = [...navData].reverse().find(
        (d) => parseDate(d.date) <= startDate
      );

      const effectiveStartEntry = startEntry || navData[navData.length - 1];
      const startNAV = effectiveStartEntry.nav;

      const simpleReturn = ((endNAV - startNAV) / startNAV) * 100;
      returns[period.trim()] = parseFloat(simpleReturn.toFixed(2));
    }

    return NextResponse.json({ returns });
  } catch (err) {
    console.error("Error in /returns endpoint:", err);
    return NextResponse.json({ error: err.message || "An internal server error occurred." }, { status: 500 });
  }
}