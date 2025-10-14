import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const { code } = await params;
  const { searchParams } = req.nextUrl;
  const period = searchParams.get('period') || '1y';
  const fromDate = searchParams.get('from');
  const toDate = searchParams.get('to');

  try {
    const res = await fetch(`https://api.mfapi.in/mf/${code}`);
    if (!res.ok) throw new Error('Failed to fetch scheme data');
    
    const scheme = await res.json();
    if (!scheme.data || scheme.data.length === 0) {
      return NextResponse.json({ error: 'No NAV data available' }, { status: 404 });
    }

    let navData = scheme.data.map(d => ({
      date: new Date(d.date.split('-').reverse().join('-')),
      nav: parseFloat(d.nav)
    })).reverse();

    // Filter by date range if provided
    if (fromDate) {
      const startDate = new Date(fromDate);
      navData = navData.filter(d => d.date >= startDate);
    }
    if (toDate) {
      const endDate = new Date(toDate);
      navData = navData.filter(d => d.date <= endDate);
    }

    // Determine rolling period in days
    let periodDays = 365;
    if (period === '3m') periodDays = 90;
    else if (period === '6m') periodDays = 180;
    else if (period === '3y') periodDays = 1095;
    else if (period === '5y') periodDays = 1825;

    const rollingReturns = [];
    
    for (let i = periodDays; i < navData.length; i++) {
      const endDate = navData[i];
      const startDate = navData[i - periodDays];
      
      if (startDate && endDate) {
        const returns = ((endDate.nav - startDate.nav) / startDate.nav) * 100;
        rollingReturns.push({
          date: endDate.date.toLocaleDateString('en-IN'),
          returns: parseFloat(returns.toFixed(2))
        });
      }
    }

    // Calculate statistics
    const returnsValues = rollingReturns.map(r => r.returns);
    const avgReturn = returnsValues.reduce((a, b) => a + b, 0) / returnsValues.length;
    const maxReturn = Math.max(...returnsValues);
    const minReturn = Math.min(...returnsValues);
    const positiveReturns = returnsValues.filter(r => r > 0).length;
    const negativeReturns = returnsValues.filter(r => r < 0).length;

    return NextResponse.json({
      period,
      data: rollingReturns.filter((_, i) => i % 7 === 0), // Sample every 7th point for performance
      statistics: {
        average: parseFloat(avgReturn.toFixed(2)),
        maximum: parseFloat(maxReturn.toFixed(2)),
        minimum: parseFloat(minReturn.toFixed(2)),
        positiveCount: positiveReturns,
        negativeCount: negativeReturns,
        totalCount: returnsValues.length
      }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
