import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// Path to our cache file in a temporary directory
const cacheFilePath = path.join(process.cwd(), ".next", "fund-status-cache.json");
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

// State to prevent multiple rebuilds from running at the same time
let isRebuilding = false;

async function rebuildCache() {
  if (isRebuilding) {
    console.log("Cache rebuild already in progress. Skipping.");
    return;
  }
  isRebuilding = true;
  console.log("Starting cache rebuild...");

  try {
    const res = await fetch("https://api.mfapi.in/mf");
    if (!res.ok) throw new Error("Failed to fetch main fund list");
    const allFunds = await res.json();

    const activeFunds = [];
    const inactiveFunds = [];

    // We can't check all 37k funds. We must use a heuristic.
    // A common heuristic is to check for a recent NAV. However, we can't do that for all funds.
    // A better proxy is to assume funds with higher scheme codes are newer and more likely active.
    // Let's take a large, recent sample to build our 'active' list.
    // This is a necessary compromise due to API limitations.
    const fundsToCheck = allFunds.slice(0, 5000); // Check the most recent 5000 funds

    const checkPromises = fundsToCheck.map(async (fund) => {
      try {
        const navRes = await fetch(`https://api.mfapi.in/mf/${fund.schemeCode}`);
        if (!navRes.ok) return { ...fund, active: false };

        const { data } = await navRes.json();
        if (!data || data.length === 0) return { ...fund, active: false };

        const lastNavDate = new Date(data[0].date.split("-").reverse().join("-"));
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        return { ...fund, active: lastNavDate >= thirtyDaysAgo };
      } catch {
        return { ...fund, active: false };
      }
    });

    const results = await Promise.all(checkPromises);

    results.forEach(fund => {
        if (fund.active) {
            activeFunds.push(fund);
        } else {
            inactiveFunds.push(fund);
        }
    });

    const cacheData = {
      activeFunds,
      inactiveFunds,
      timestamp: Date.now(),
    };

    await fs.writeFile(cacheFilePath, JSON.stringify(cacheData));
    console.log(`Cache rebuilt successfully. Active: ${activeFunds.length}, Inactive: ${inactiveFunds.length}`);
  } catch (error) {
    console.error("Failed to rebuild cache:", error);
  } finally {
    isRebuilding = false;
  }
}

export async function GET() {
  try {
    const stats = await fs.stat(cacheFilePath).catch(() => null); // Handle case where file doesn't exist

    if (!stats || Date.now() - stats.mtimeMs > CACHE_TTL) {
      // Cache is old or missing, trigger a rebuild but don't wait for it
      rebuildCache();
    }

    if (stats) {
      // If cache exists (even if stale), return it immediately
      const cachedData = JSON.parse(await fs.readFile(cacheFilePath, "utf-8"));
      return NextResponse.json(cachedData);
    }

    // If no cache exists at all (first run), show a loading state and trigger rebuild
    rebuildCache();
    return NextResponse.json({ status: "building", message: "Fund database is being built. Please try again in a few minutes." }, { status: 202 });

  } catch (error) {
    console.error("Error in GET /api/mf:", error);
    return NextResponse.json({ error: "Failed to retrieve fund data." }, { status: 500 });
  }
}