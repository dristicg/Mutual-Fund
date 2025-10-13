
// import { addMonths, addWeeks, differenceInDays, parseISO, formatISO } from "date-fns";
// import { findNearestNavBefore } from "./navUtils.js";

// function iterateDates(fromISO, toISO, freq = "monthly") {
//   const arr = [];
//   let cur = parseISO(fromISO);
//   const end = parseISO(toISO);

//   while (cur <= end) {
//     arr.push(formatISO(cur, { representation: "date" }));
//     if (freq === "monthly") cur = addMonths(cur, 1);
//     else if (freq === "weekly") cur = addWeeks(cur, 1);
//     else if (freq === "quarterly") cur = addMonths(cur, 3);
//     else cur = addMonths(cur, 1);
//   }
//   return arr;
// }

// export function computeSip(navHistory, { amount, frequency, from, to }) {
//   const sipDates = iterateDates(from, to, frequency);
//   let totalUnits = 0,
//     totalInvested = 0;
//   const series = [];

//   for (const d of sipDates) {
//     const navEntry = findNearestNavBefore(navHistory, d);
//     if (!navEntry) continue;

//     const units = amount / navEntry.nav;
//     totalUnits += units;
//     totalInvested += amount;

//     series.push({
//       date: d,
//       invested: totalInvested,
//       value: totalUnits * navEntry.nav,
//     });
//   }

//   const latest = navHistory[navHistory.length - 1];
//   const currentValue = totalUnits * (latest ? latest.nav : 0);
//   const absoluteReturn = totalInvested
//     ? ((currentValue - totalInvested) / totalInvested) * 100
//     : 0;

//   const days = differenceInDays(parseISO(to), parseISO(from)) || 1;
//   const years = days / 365;
//   const annualizedReturn =
//     totalInvested && years > 0
//       ? (Math.pow(currentValue / totalInvested, 1 / years) - 1) * 100
//       : null;

//   return {
//     totalInvested,
//     totalUnits,
//     currentValue,
//     absoluteReturn,
//     annualizedReturn,
//     series,
//   };
// }

import { addMonths, addWeeks, differenceInDays, parseISO, formatISO } from "date-fns";
import { findNearestNavBefore } from "./navUtils.js";

function iterateDates(fromISO, toISO, freq = "monthly") {
  const arr = [];
  let cur = parseISO(fromISO);
  const end = parseISO(toISO);

  while (cur <= end) {
    arr.push(formatISO(cur, { representation: "date" }));
    if (freq === "monthly") cur = addMonths(cur, 1);
    else if (freq === "weekly") cur = addWeeks(cur, 1);
    else if (freq === "quarterly") cur = addMonths(cur, 3);
    else cur = addMonths(cur, 1);
  }
  return arr;
}

export function computeSip(navHistory, { amount, frequency, from, to }) {
  const sipDates = iterateDates(from, to, frequency);
  let totalUnits = 0,
    totalInvested = 0;
  const series = [];

  for (const d of sipDates) {
    const navEntry = findNearestNavBefore(navHistory, d);
    if (!navEntry) continue;

    const units = amount / navEntry.nav;
    totalUnits += units;
    totalInvested += amount;

    series.push({
      date: d,
      invested: totalInvested,
      // Value of all accumulated units (totalUnits) at this SIP date's NAV (navEntry.nav)
      value: totalUnits * navEntry.nav,
    });
  }

  // --- START: THE CRITICAL FIX ---
  // Find the NAV on the specified 'to' date for final valuation.
  const endNavEntry = findNearestNavBefore(navHistory, to);
  const endNav = endNavEntry ? endNavEntry.nav : 0;
  
  const currentValue = totalUnits * endNav;
  
  const absoluteReturn = totalInvested
    ? ((currentValue - totalInvested) / totalInvested) * 100
    : 0;
  // --- END: THE CRITICAL FIX ---


  const days = differenceInDays(parseISO(to), parseISO(from)) || 1;
  const years = days / 365;
  const annualizedReturn =
    totalInvested && years > 0
      ? (Math.pow(currentValue / totalInvested, 1 / years) - 1) * 100
      : null;

  return {
    totalInvested,
    totalUnits,
    currentValue,
    absoluteReturn,
    annualizedReturn,
    series,
  };
}