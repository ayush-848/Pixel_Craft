import mongoose, { Mongoose } from 'mongoose';

const MONGODB_URL = process.env.MONGODB_URL;

// Define the Mongoose connection interface
interface MongooseConnection {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// Extend the global object to include a mongoose property
declare global {
  // Allow global `mongoose` object to be used and cached across re-renders
  var mongoose: MongooseConnection | undefined;
}

// Check if there is an existing cached connection
let cached: MongooseConnection = global.mongoose || { conn: null, promise: null };

// If there is no cache, initialize it
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectToDatabase = async (): Promise<Mongoose> => {
  if (cached.conn) {
    console.log('Using existing Mongoose connection');
    return cached.conn;
  }

  if (!MONGODB_URL) {
    throw new Error('Missing MONGODB_URL');
  }

  // If there is no existing connection promise, create one
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URL, {
      dbName: 'pixel_craft', // Replace with your DB name
      bufferCommands: false,
    });
  }

  try {
    cached.conn = await cached.promise;
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw new Error('MongoDB connection failed');
  }

  return cached.conn;
};
