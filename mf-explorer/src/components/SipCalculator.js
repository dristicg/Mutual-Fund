

// src/utils/sipCalculator.js
export function calculateSIP(navData, { amount, frequency, startDate, endDate }) {
  if (!navData || navData.length === 0) {
    return { status: "needs_review", reason: "No NAV data" };
  }

  const parseDate = (d) => new Date(d.split("-").reverse().join("-")); 
  const parsedNAV = navData
    .map((d) => ({
      date: parseDate(d.date),
      nav: parseFloat(d.nav),
    }))
    .filter((d) => !isNaN(d.nav) && d.nav > 0)
    .sort((a, b) => a.date - b.date);

  const sDate = new Date(startDate);
  const eDate = new Date(endDate);
  let sipInterval = frequency === "quarterly" ? 3 : 1; // months

  let invested = 0;
  let units = 0;

  // iterate SIP dates
  let current = new Date(sDate);
  while (current <= eDate) {
    // find NAV on or before current date
    let navEntry = [...parsedNAV].reverse().find((d) => d.date <= current);
    if (navEntry) {
      let u = amount / navEntry.nav;
      units += u;
      invested += amount;
    }

    // increment by frequency
    current.setMonth(current.getMonth() + sipInterval);
  }

  // final NAV
  let lastNav = parsedNAV[parsedNAV.length - 1];
  if (!lastNav) {
    return { status: "needs_review", reason: "No end NAV available" };
  }

  const totalValue = units * lastNav.nav;
  const absReturn = ((totalValue - invested) / invested) * 100;

  // annualized return
  const years = (eDate - sDate) / (1000 * 60 * 60 * 24 * 365);
  const annReturn =
    years > 0 ? (Math.pow(totalValue / invested, 1 / years) - 1) * 100 : 0;

  return {
    status: "ok",
    totalInvested: invested,
    currentValue: totalValue,
    absoluteReturn: absReturn,
    annualizedReturn: annReturn,
    units,
    lastNav: lastNav.nav,
  };
}
