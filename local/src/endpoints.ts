export default {
  session: {
    get: 6000,
    create: 6001,
    getAll: 6002,
  },
  gameData: {
    get: 6010,
    create: 6011,
    getAll: 6012,
  },
} as Record<string, Record<string, number>>;
