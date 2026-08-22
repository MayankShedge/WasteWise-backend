const cache = new Map();

export const CACHE_KEYS = {
  ALL_LOCATIONS:  'locations:all',
  LEADERBOARD:    'users:leaderboard',
  GUIDE_DATA:     'guide:all',
};

export const TTL = {
  TEN_MINUTES:    10 * 60 * 1000,
  FIVE_MINUTES:   5  * 60 * 1000,
  ONE_HOUR:       60 * 60 * 1000,
  FOREVER:        365 * 24 * 60 * 60 * 1000, // 1 year — effectively permanent
};

/**
 * Store a value in cache with a TTL (time to live) in milliseconds
 * @param {string} key - cache key
 * @param {any} value - data to cache
 * @param {number} ttl - time to live in ms (default 10 minutes)
 */
export const setCache = (key, value, ttl = 10 * 60 * 1000) => {
  const expiresAt = Date.now() + ttl;
  cache.set(key, { value, expiresAt });
  console.log(`✅ Cache SET: ${key} (expires in ${ttl / 1000}s)`);
};

/**
 * Retrieve a value from cache
 * Returns null if key doesn't exist or has expired
 * @param {string} key - cache key
 */
export const getCache = (key) => {
  const entry = cache.get(key);

  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    console.log(`⏰ Cache EXPIRED: ${key}`);
    return null;
  }

  console.log(`⚡ Cache HIT: ${key}`);
  return entry.value;
};

/**
 * Delete a specific key from cache
 * Call this when data changes (after create, update, delete)
 * @param {string} key - cache key to invalidate
 */
export const invalidateCache = (key) => {
  cache.delete(key);
  console.log(`🗑️ Cache INVALIDATED: ${key}`);
};

/**
 * Delete multiple keys at once
 * Useful when one action affects multiple cached endpoints
 * @param {string[]} keys - array of cache keys to invalidate
*/
export const invalidateMany = (keys) => {
  keys.forEach(key => {
    cache.delete(key);
    console.log(`🗑️ Cache INVALIDATED: ${key}`);
  });
};

/** 
 * Clear the entire cache
 * Useful for testing or emergency reset
*/
export const clearAllCache = () => {
  cache.clear();
  console.log('🧹 Cache CLEARED: all keys removed');
};

/*
Get current cache stats — useful for admin monitoring
*/
export const getCacheStats = () => {
  const stats = [];
  const now = Date.now();

  for (const [key, entry] of cache.entries()) {
    const remainingMs = entry.expiresAt - now;
    stats.push({
      key,
      expiresIn: remainingMs > 0 ? `${Math.round(remainingMs / 1000)}s` : 'expired',
      isAlive: remainingMs > 0,
    });
  }

  return {
    totalKeys: cache.size,
    keys: stats,
  };
};