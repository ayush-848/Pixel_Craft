import mongoose, { Mongoose } from 'mongoose';

const MONGODB_URL = process.env.MONGODB_URL;

// Define the Mongoose connection interface
interface MongooseConnection {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// Extend the global object to include a mongoose property
declare global {
  var mongoose: MongooseConnection | undefined;
}

// Check if there is an existing cached connection
let cached: MongooseConnection = global.mongoose || { conn: null, promise: null };

// If there is no cache, initialize it
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectToDatabase = async (): Promise<Mongoose> => {
  if (cached.conn) return cached.conn;

  if (!MONGODB_URL) throw new Error('Missing MONGODB_URL');

  // If there is no existing connection promise, create one
  cached.promise = cached.promise || mongoose.connect(MONGODB_URL, { 
    dbName: 'Pixel Craft', 
    bufferCommands: false 
  });

  // Wait for the promise to resolve and store the connection
  cached.conn = await cached.promise;

  return cached.conn;
};
