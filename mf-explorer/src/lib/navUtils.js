
// Find nearest NAV entry on or before target date
export function findNearestNavBefore(navHistory, targetISO) {
  let lo = 0,
    hi = navHistory.length - 1,
    best = -1;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (navHistory[mid].date <= targetISO) {
      best = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  if (best === -1) return null;
  const entry = navHistory[best];
  if (!entry || entry.nav <= 0) return null;
  return entry;
}
