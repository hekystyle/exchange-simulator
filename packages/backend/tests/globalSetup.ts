import { MongoMemoryReplSet } from 'mongodb-memory-server';

export default async () => {
  const replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });

  process.env.DATABASE_URL = replSet.getUri();

  return async () => await replSet.stop();
};
