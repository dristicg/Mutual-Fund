import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  const { code } = await params;
  const body = await req.json();
  const { initialInvestment, withdrawalAmount, frequency, from, to } = body;

  if (!initialInvestment || !withdrawalAmount || !from || !to) {
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

    // Find NAV on or before a date
    const findNavBefore = (targetDate, navArr) => {
      for (let i = navArr.length - 1; i >= 0; i--) {
        if (navArr[i].date <= targetDate) {
          return navArr[i];
        }
      }
      return null;
    };

    const startNavEntry = findNavBefore(startDate, parsedNAV);
    if (!startNavEntry) {
      return NextResponse.json({ 
        status: "needs_review", 
        reason: "Start date is before first available NAV" 
      });
    }

    // Calculate initial units
    let totalUnits = initialInvestment / startNavEntry.nav;
    let totalWithdrawn = 0;
    const withdrawalInterval = frequency === "quarterly" ? 3 : 1; // months

    // Generate withdrawal dates
    const withdrawalDates = [];
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      withdrawalDates.push(new Date(currentDate));
      currentDate = new Date(currentDate.setMonth(currentDate.getMonth() + withdrawalInterval));
    }

    // Process withdrawals
    const growthData = [];
    let accumulatedWithdrawal = 0;

    for (const withdrawalDate of withdrawalDates) {
      const navEntry = findNavBefore(withdrawalDate, parsedNAV);
      if (!navEntry) continue;

      // Calculate units to redeem for this withdrawal
      const unitsToRedeem = withdrawalAmount / navEntry.nav;
      
      // Check if we have enough units
      if (totalUnits >= unitsToRedeem) {
        totalUnits -= unitsToRedeem;
        totalWithdrawn += withdrawalAmount;
        accumulatedWithdrawal += withdrawalAmount;
      } else {
        // Partial withdrawal if units are insufficient
        const partialWithdrawal = totalUnits * navEntry.nav;
        totalWithdrawn += partialWithdrawal;
        accumulatedWithdrawal += partialWithdrawal;
        totalUnits = 0;
      }

      growthData.push({
        date: withdrawalDate.toISOString().split("T")[0],
        remainingValue: parseFloat((totalUnits * navEntry.nav).toFixed(2)),
        withdrawn: parseFloat(accumulatedWithdrawal.toFixed(2)),
        units: parseFloat(totalUnits.toFixed(4)),
        nav: parseFloat(navEntry.nav.toFixed(4))
      });

      // Stop if units are exhausted
      if (totalUnits === 0) break;
    }

    // Final valuation
    const endNavEntry = findNavBefore(endDate, parsedNAV) || parsedNAV[parsedNAV.length - 1];
    const remainingValue = totalUnits * endNavEntry.nav;
    const totalValue = remainingValue + totalWithdrawn;

    return NextResponse.json({
      status: "ok",
      initialInvestment: parseFloat(initialInvestment.toFixed(2)),
      totalWithdrawn: parseFloat(totalWithdrawn.toFixed(2)),
      remainingValue: parseFloat(remainingValue.toFixed(2)),
      totalValue: parseFloat(totalValue.toFixed(2)),
      remainingUnits: parseFloat(totalUnits.toFixed(4)),
      withdrawals: withdrawalDates.length,
      exhausted: totalUnits === 0,
      growth: growthData,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
