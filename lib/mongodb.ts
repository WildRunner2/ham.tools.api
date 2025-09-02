import { MongoClient, Db } from 'mongodb';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME || 'sp3fck_ham_tools';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();

  const db = client.db(DB_NAME);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

export async function getUsersCollection() {
  const { db } = await connectToDatabase();
  return db.collection('users');
}

export async function getPhotosCollection() {
  const { db } = await connectToDatabase();
  return db.collection('photos');
}

export async function getIframeConfigsCollection() {
  const { db } = await connectToDatabase();
  return db.collection('iframe_configs');
}

// Initialize indexes
export async function initializeIndexes() {
  try {
    const { db } = await connectToDatabase();

    // Users collection indexes
    const usersCollection = db.collection('users');
    await usersCollection.createIndex({ callsign: 1 }, { unique: true });
    await usersCollection.createIndex({ email: 1 }, { unique: true });

    // Photos collection indexes
    const photosCollection = db.collection('photos');
    await photosCollection.createIndex({ userId: 1 });
    await photosCollection.createIndex({ isPublic: 1 });
    await photosCollection.createIndex({ uploadDate: -1 });
    await photosCollection.createIndex({ tags: 1 });

    // Iframe configs collection indexes
    const iframeConfigsCollection = db.collection('iframe_configs');
    await iframeConfigsCollection.createIndex({ userId: 1 });
    await iframeConfigsCollection.createIndex({ isPublic: 1 });

    console.log('Database indexes initialized successfully');
  } catch (error) {
    console.error('Error initializing database indexes:', error);
  }
}
