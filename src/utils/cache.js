// Cache functions disabled - caching not required
// Functions are no-ops but interface is maintained for compatibility

const getCache = async (key) => {
  return null;
};

const setCache = async (key, data, expiresIn = 3600) => {
  // Caching disabled
};

const deleteCache = async (key) => {
  // Caching disabled
};

const invalidatePattern = async (pattern) => {
  // Caching disabled
};

module.exports = {
  getCache,
  setCache,
  deleteCache,
  invalidatePattern,
};
