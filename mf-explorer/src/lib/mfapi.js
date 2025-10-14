
import axios from "axios";

function ddmmyyyyToISO(str) {
  const [d, m, y] = str.split("-");
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

// Fetch scheme list
export async function fetchAllSchemes() {
  const url = "https://api.mfapi.in/mf";
  const res = await axios.get(url, { timeout: 10000 });
  return res.data || [];
}

// Fetch single scheme (meta + nav history)
export async function fetchScheme(code) {
  const url = `https://api.mfapi.in/mf/${code}`;
  const res = await axios.get(url, { timeout: 10000 });
  const { meta, data } = res.data;

  const navHistory = (data || [])
    .map((item) => ({
      date: ddmmyyyyToISO(item.date),
      nav: parseFloat(item.nav.replace(",", "")),
    }))
    .filter((x) => !Number.isNaN(x.nav));

  navHistory.sort((a, b) => a.date.localeCompare(b.date));
  return { meta, navHistory };
}
