import { createClient } from 'redis';

let redisClient = null;
let isRedisConnected = false;

// Cache stats tracking
const cacheStats = { hits: 0, misses: 0, errors: 0 };

async function connectRedis() {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err.message);
      isRedisConnected = false;
    });

    redisClient.on('connect', () => {
      console.log('Redis connected');
      isRedisConnected = true;
    });

    redisClient.on('end', () => {
      console.log('Redis disconnected');
      isRedisConnected = false;
    });

    await redisClient.connect();
  } catch (err) {
    console.warn('Redis unavailable, running without cache:', err.message);
    isRedisConnected = false;
  }
}

async function getCache(key) {
  try {
    if (!isRedisConnected || !redisClient) {
      cacheStats.misses++;
      return null;
    }
    const data = await redisClient.get(key);
    if (data) {
      cacheStats.hits++;
      return JSON.parse(data);
    }
    cacheStats.misses++;
    return null;
  } catch (err) {
    cacheStats.errors++;
    console.error('Redis GET error:', err.message);
    return null;
  }
}

async function setCache(key, value, ttlSeconds = 900) {
  try {
    if (!isRedisConnected || !redisClient) return;
    await redisClient.set(key, JSON.stringify(value), { EX: ttlSeconds });
  } catch (err) {
    cacheStats.errors++;
    console.error('Redis SET error:', err.message);
  }
}

async function invalidateCache(pattern) {
  try {
    if (!isRedisConnected || !redisClient) return;
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (err) {
    cacheStats.errors++;
    console.error('Redis INVALIDATE error:', err.message);
  }
}

function getCacheStats() {
  return { ...cacheStats, connected: isRedisConnected };
}

export { connectRedis, getCache, setCache, invalidateCache, getCacheStats, redisClient };
