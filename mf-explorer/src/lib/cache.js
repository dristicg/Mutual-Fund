
// Simple in-memory cache using NodeCache
import NodeCache from "node-cache";

const TTL = Number(process.env.CACHE_TTL || 24 * 3600); // 24h default

if (!global._mfCache) {
  global._mfCache = new NodeCache({ stdTTL: TTL, checkperiod: 600 });
}

export const cache = global._mfCache;
