import mongoose from "mongoose";
import dns from "node:dns/promises";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
  };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (cached.promise) {
    cached.conn = await cached.promise;

    return cached.conn;
  }

  console.log("MongoDB: creating new connection...");

  cached.promise = mongoose.connect(MONGODB_URI, {
    family: 4,
    dbName: "zerodose",
  });

  try {
    cached.conn = await cached.promise;

    console.log("MongoDB: connected successfully");

    return cached.conn;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;

    console.error("MongoDB connection failed:", error);

    throw error;
  }
}
