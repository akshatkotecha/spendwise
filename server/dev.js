// Local dev: starts an in-memory MongoDB so no install or account is needed.
const { MongoMemoryServer } = require('mongodb-memory-server');

(async () => {
  const mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri('spendwise');
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
  require('./index');
})();
