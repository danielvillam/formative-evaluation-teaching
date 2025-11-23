import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

let client;
let clientPromise;

if (!uri) {
  console.error('MONGODB_URI is not defined in environment variables');
  console.error('Available env vars:', Object.keys(process.env).filter(k => k.includes('MONGO')));
  throw new Error('Please add your MongoDB URI to environment variables');
}

// Use a single connection pattern for both dev and production
if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

export async function connectToDatabase() {
  try {
    const client = await clientPromise;
    const db = client.db('evaluation_formative');
    console.log('Successfully connected to MongoDB');
    return db;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    console.error('MongoDB URI exists:', !!uri);
    console.error('URI starts with:', uri?.substring(0, 20));
    throw error;
  }
}