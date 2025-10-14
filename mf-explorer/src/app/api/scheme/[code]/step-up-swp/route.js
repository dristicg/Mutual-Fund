import { NextResponse } from 'next/server';

export async function POST(req, { params }) {
  const { code } = await params;
  const body = await req.json();
  const { initialInvestment, withdrawalAmount, incrementPercentage, frequency, from, to } = body;

  try {
    const res = await fetch(`https://api.mfapi.in/mf/${code}`);
    if (!res.ok) throw new Error('Failed to fetch scheme data');
    
    const scheme = await res.json();
    if (!scheme.data || scheme.data.length === 0) {
      return NextResponse.json({ error: 'No NAV data available' }, { status: 404 });
    }

    const navData = scheme.data.map(d => ({
      date: new Date(d.date.split('-').reverse().join('-')),
      nav: parseFloat(d.nav)
    })).reverse();

    const startDate = new Date(from);
    const endDate = new Date(to);
    
    const startNav = navData.find(d => d.date >= startDate)?.nav || navData[0].nav;
    let units = initialInvestment / startNav;
    let totalWithdrawn = 0;
    let withdrawals = 0;
    let currentDate = new Date(startDate);
    let currentWithdrawal = withdrawalAmount;
    let yearCounter = 0;
    let exhausted = false;

    while (currentDate <= endDate && units > 0) {
      const navEntry = navData.find(d => d.date >= currentDate) || navData[navData.length - 1];
      if (!navEntry) break;

      const unitsToSell = currentWithdrawal / navEntry.nav;
      
      if (unitsToSell > units) {
        totalWithdrawn += units * navEntry.nav;
        units = 0;
        exhausted = true;
        break;
      }

      units -= unitsToSell;
      totalWithdrawn += currentWithdrawal;
      withdrawals++;

      // Increment date based on frequency
      if (frequency === 'monthly') {
        currentDate.setMonth(currentDate.getMonth() + 1);
      } else if (frequency === 'quarterly') {
        currentDate.setMonth(currentDate.getMonth() + 3);
      }

      // Step up withdrawal annually
      yearCounter++;
      if (yearCounter % 12 === 0 && frequency === 'monthly') {
        currentWithdrawal = currentWithdrawal * (1 + incrementPercentage / 100);
      } else if (yearCounter % 4 === 0 && frequency === 'quarterly') {
        currentWithdrawal = currentWithdrawal * (1 + incrementPercentage / 100);
      }
    }

    const finalNav = navData[navData.length - 1].nav;
    const remainingValue = units * finalNav;

    return NextResponse.json({
      initialInvestment,
      totalWithdrawn: parseFloat(totalWithdrawn.toFixed(2)),
      remainingValue: parseFloat(remainingValue.toFixed(2)),
      withdrawals,
      exhausted
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
