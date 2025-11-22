// Redis support disabled - not required
// Cache functions are no-ops but interface is maintained for compatibility

const initRedis = async () => {
  console.log('Redis caching is disabled');
  return null;
};

const getRedisClient = () => null;

const closeRedis = async () => {
  // No Redis connection to close
};

module.exports = {
  initRedis,
  getRedisClient,
  closeRedis,
};
