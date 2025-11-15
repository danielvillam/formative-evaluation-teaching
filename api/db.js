import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);

export async function connectToDatabase() {
  if (!client.isConnected) {
    await client.connect();
  }
  return client.db('evaluation_formative');
}