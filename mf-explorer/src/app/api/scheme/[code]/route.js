

import { NextResponse } from "next/server";

const schemeCache = new Map();
const TTL = 1000 * 60 * 60 * 12; // 12h

// --- GET ROUTE ---
export async function GET(request, { params }) {
  const { code } = await params;
  const now = Date.now();

  if (schemeCache.has(code)) {
    const cached = schemeCache.get(code);
    if (now - cached.timestamp < TTL) return NextResponse.json(cached.data);
  }

  try {
    const res = await fetch(`https://api.mfapi.in/mf/${code}`);
    if (!res.ok) throw new Error("Failed to fetch scheme data");

    const data = await res.json();
    schemeCache.set(code, { data, timestamp: now });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message || "Something went wrong" }, { status: 500 });
  }
}

// --- POST: calculate SIP ---
export async function POST(request, { params }) {
  const { code } = await params; 
  const body = await request.json();

  try {
    // Use cache if available
    const now = Date.now();
    if (schemeCache.has(code)) {
      const cached = schemeCache.get(code);
      if (now - cached.timestamp < TTL) {
        const result = calculateSIP(cached.data.data, {
          amount: body.amount,
          frequency: body.frequency,
          startDate: body.from,
          endDate: body.to,
        });
        return NextResponse.json(result);
      }
    }

    // Fetch fresh data if not cached
    const res = await fetch(`https://api.mfapi.in/mf/${code}`);
    if (!res.ok) throw new Error("Failed to fetch scheme data");

    const data = await res.json();
    schemeCache.set(code, { data, timestamp: now });

    const result = calculateSIP(data.data, {
      amount: body.amount,
      frequency: body.frequency,
      startDate: body.from,
      endDate: body.to,
    });

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// --- Corrected SIP calculation logic ---
export function calculateSIP(navHistory, { amount, frequency, startDate, endDate }) {
  // Validation checks
  if (!navHistory || navHistory.length === 0)
    return { status: "needs_review", reason: "No NAV data" };

  if (!amount || amount <= 0)
    return { status: "needs_review", reason: "Invalid investment amount" };

  // Date parsing and NAV preparation
  const parseDate = (d) => new Date(d.split("-").reverse().join("-"));
  const parsedNAV = navHistory
    .map((d) => ({ date: parseDate(d.date), nav: parseFloat(d.nav) }))
    .filter((d) => !isNaN(d.nav) && d.nav > 0)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  if (parsedNAV.length === 0) {
    return { status: "needs_review", reason: "No valid NAV data available" };
  }

  const sDate = new Date(startDate);
  const eDate = new Date(endDate);
  
  if (sDate >= eDate) {
    return { status: "needs_review", reason: "Start date must be before end date" };
  }

  const sipInterval = frequency === "quarterly" ? 3 : 1; // months

  // Function to find the nearest NAV on or before the target date
  const findNavBefore = (targetDate, navArr) => {
    for (let i = navArr.length - 1; i >= 0; i--) {
      if (navArr[i].date <= targetDate) {
        return navArr[i];
      }
    }
    return null;
  };

  // --- Investment Calculation ---
  let totalInvested = 0;
  let totalUnits = 0;
  let currentDate = new Date(sDate);
  const investmentDates = [];

  // Collect all investment dates first
  while (currentDate <= eDate) {
    investmentDates.push(new Date(currentDate));
    currentDate = new Date(currentDate.setMonth(currentDate.getMonth() + sipInterval));
  }

  // Process each investment date
  investmentDates.forEach(investmentDate => {
    const navEntry = findNavBefore(investmentDate, parsedNAV);
    if (navEntry) {
      const units = amount / navEntry.nav;
      totalUnits += units;
      totalInvested += amount;
    }
  });

  if (totalInvested === 0) {
    return { status: "needs_review", reason: "No investments were made in the selected period." };
  }

  // --- Growth Chart Calculation ---
  let accumulatedUnits = 0;
  let accumulatedInvestment = 0;
  let nextInvestmentIndex = 0;
  const growthData = [];

  parsedNAV.forEach((navPoint) => {
    // Only consider NAV points within our date range
    if (navPoint.date >= sDate && navPoint.date <= eDate) {
      // Add investments that occurred on or before this NAV date
      while (nextInvestmentIndex < investmentDates.length && 
             investmentDates[nextInvestmentIndex] <= navPoint.date) {
        const investmentDate = investmentDates[nextInvestmentIndex];
        const investmentNav = findNavBefore(investmentDate, parsedNAV);
        if (investmentNav) {
          accumulatedUnits += amount / investmentNav.nav;
          accumulatedInvestment += amount;
        }
        nextInvestmentIndex++;
      }

      // Calculate current value for this NAV point
      const currentValue = accumulatedUnits * navPoint.nav;
      
      growthData.push({ 
        date: navPoint.date.toISOString().split("T")[0], 
        value: parseFloat(currentValue.toFixed(2)),
        invested: parseFloat(accumulatedInvestment.toFixed(2)),
        nav: parseFloat(navPoint.nav.toFixed(4))
      });
    }
  });

  // --- Final Calculation ---
  const finalNavEntry = findNavBefore(eDate, parsedNAV) || parsedNAV[parsedNAV.length - 1];
  
  if (!finalNavEntry) {
    return { status: "needs_review", reason: "End date is before first available NAV." };
  }

  const currentValue = totalUnits * finalNavEntry.nav;
  const absoluteReturn = totalInvested > 0 ? ((currentValue - totalInvested) / totalInvested) * 100 : 0;

  const years = (eDate.getTime() - sDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  const annualizedReturn = years > 0 && totalInvested > 0
    ? (Math.pow(currentValue / totalInvested, 1 / years) - 1) * 100
    : 0;

  return {
    status: "ok",
    totalInvested: parseFloat(totalInvested.toFixed(2)),
    currentValue: parseFloat(currentValue.toFixed(2)),
    absoluteReturn: parseFloat(absoluteReturn.toFixed(2)),
    annualizedReturn: parseFloat(annualizedReturn.toFixed(2)),
    totalUnits: parseFloat(totalUnits.toFixed(4)),
    lastNav: parseFloat(finalNavEntry.nav.toFixed(4)),
    lastNavDate: finalNavEntry.date.toISOString().split("T")[0],
    installments: Math.round(totalInvested / amount),
    growth: growthData,
  };
}