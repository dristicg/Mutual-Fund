import { NextResponse } from 'next/server';

export async function POST(req, { params }) {
  const { code } = await params;
  const body = await req.json();
  const { amount, incrementPercentage, frequency, from, to } = body;

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
    
    let currentAmount = amount;
    let totalInvested = 0;
    let units = 0;
    const growth = [];
    let currentDate = new Date(startDate);
    let yearCounter = 0;

    while (currentDate <= endDate) {
      const navEntry = navData.find(d => d.date >= currentDate) || navData[navData.length - 1];
      if (!navEntry) break;

      const unitsAdded = currentAmount / navEntry.nav;
      units += unitsAdded;
      totalInvested += currentAmount;

      const currentValue = units * navEntry.nav;
      growth.push({
        date: currentDate.toLocaleDateString('en-IN'),
        invested: totalInvested,
        value: currentValue,
        amount: currentAmount
      });

      // Increment date based on frequency
      if (frequency === 'monthly') {
        currentDate.setMonth(currentDate.getMonth() + 1);
      } else if (frequency === 'quarterly') {
        currentDate.setMonth(currentDate.getMonth() + 3);
      }

      // Step up amount annually
      yearCounter++;
      if (yearCounter % 12 === 0 && frequency === 'monthly') {
        currentAmount = currentAmount * (1 + incrementPercentage / 100);
      } else if (yearCounter % 4 === 0 && frequency === 'quarterly') {
        currentAmount = currentAmount * (1 + incrementPercentage / 100);
      }
    }

    const finalNav = navData[navData.length - 1].nav;
    const currentValue = units * finalNav;
    const absoluteReturn = ((currentValue - totalInvested) / totalInvested) * 100;
    
    const years = (endDate - startDate) / (365.25 * 24 * 60 * 60 * 1000);
    const annualizedReturn = (Math.pow(currentValue / totalInvested, 1 / years) - 1) * 100;

    return NextResponse.json({
      totalInvested,
      currentValue,
      absoluteReturn: parseFloat(absoluteReturn.toFixed(2)),
      annualizedReturn: parseFloat(annualizedReturn.toFixed(2)),
      units: parseFloat(units.toFixed(4)),
      growth
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
