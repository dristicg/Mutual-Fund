import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  const { code } = await params;
  const body = await req.json();
  const { amount, from, to } = body;

  if (!amount || !from || !to) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  try {
    // Fetch scheme data
    const res = await fetch(`https://api.mfapi.in/mf/${code}`);
    if (!res.ok) throw new Error("Failed to fetch scheme data");

    const scheme = await res.json();
    const navData = scheme.data;

    if (!navData || navData.length === 0) {
      return NextResponse.json({ 
        status: "needs_review", 
        reason: "No NAV data available" 
      });
    }

    // Parse dates and NAV
    const parseDate = (d) => new Date(d.split("-").reverse().join("-"));
    const parsedNAV = navData
      .map((d) => ({ date: parseDate(d.date), nav: parseFloat(d.nav) }))
      .filter((d) => !isNaN(d.nav) && d.nav > 0)
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    if (parsedNAV.length === 0) {
      return NextResponse.json({ 
        status: "needs_review", 
        reason: "No valid NAV data" 
      });
    }

    const startDate = new Date(from);
    const endDate = new Date(to);

    if (startDate >= endDate) {
      return NextResponse.json({ 
        status: "needs_review", 
        reason: "Start date must be before end date" 
      });
    }

    // Find NAV on or before start date
    const findNavBefore = (targetDate, navArr) => {
      for (let i = navArr.length - 1; i >= 0; i--) {
        if (navArr[i].date <= targetDate) {
          return navArr[i];
        }
      }
      return null;
    };

    const startNavEntry = findNavBefore(startDate, parsedNAV);
    const endNavEntry = findNavBefore(endDate, parsedNAV) || parsedNAV[parsedNAV.length - 1];

    if (!startNavEntry) {
      return NextResponse.json({ 
        status: "needs_review", 
        reason: "Start date is before first available NAV" 
      });
    }

    if (!endNavEntry) {
      return NextResponse.json({ 
        status: "needs_review", 
        reason: "End date is before first available NAV" 
      });
    }

    // Calculate units purchased
    const units = amount / startNavEntry.nav;
    const currentValue = units * endNavEntry.nav;
    const absoluteReturn = ((currentValue - amount) / amount) * 100;

    // Calculate annualized return (CAGR)
    const years = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    const annualizedReturn = years > 0 
      ? (Math.pow(currentValue / amount, 1 / years) - 1) * 100 
      : 0;

    // Generate growth data for chart
    const growthData = parsedNAV
      .filter(nav => nav.date >= startDate && nav.date <= endDate)
      .map(nav => ({
        date: nav.date.toISOString().split("T")[0],
        value: parseFloat((units * nav.nav).toFixed(2)),
        invested: parseFloat(amount.toFixed(2)),
        nav: parseFloat(nav.nav.toFixed(4))
      }));

    return NextResponse.json({
      status: "ok",
      invested: parseFloat(amount.toFixed(2)),
      currentValue: parseFloat(currentValue.toFixed(2)),
      absoluteReturn: parseFloat(absoluteReturn.toFixed(2)),
      annualizedReturn: parseFloat(annualizedReturn.toFixed(2)),
      units: parseFloat(units.toFixed(4)),
      startNav: parseFloat(startNavEntry.nav.toFixed(4)),
      endNav: parseFloat(endNavEntry.nav.toFixed(4)),
      startDate: startNavEntry.date.toISOString().split("T")[0],
      endDate: endNavEntry.date.toISOString().split("T")[0],
      growth: growthData,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
