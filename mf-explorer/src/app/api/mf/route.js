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

    // Check funds in batches to avoid overwhelming the API
    const BATCH_SIZE = 100;
    const DELAY_BETWEEN_BATCHES = 100; // ms
    const MAX_FUNDS_TO_CHECK = 10000; // Check first 10k funds

    const fundsToCheck = allFunds.slice(0, MAX_FUNDS_TO_CHECK);
    
    for (let i = 0; i < fundsToCheck.length; i += BATCH_SIZE) {
      const batch = fundsToCheck.slice(i, i + BATCH_SIZE);
      
      const checkPromises = batch.map(async (fund) => {
        try {
          // A fund is active if isinGrowth is not null
          const isActive = fund.isinGrowth !== null;
          return { ...fund, active: isActive };
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

      console.log(`Processed ${Math.min(i + BATCH_SIZE, fundsToCheck.length)}/${fundsToCheck.length} funds. Active: ${activeFunds.length}, Inactive: ${inactiveFunds.length}`);
      
      // Small delay between batches
      if (i + BATCH_SIZE < fundsToCheck.length) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }
    }

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