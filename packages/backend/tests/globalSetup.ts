import { MongoMemoryReplSet } from 'mongodb-memory-server';

export default async () => {
  const replSet = await MongoMemoryReplSet.create({
    replSet: {
      count: 1,
      storageEngine: 'wiredTiger',
    },
  });

  process.env.DATABASE_URL = replSet.getUri('vitest');

  return async () => await replSet.stop();
};
