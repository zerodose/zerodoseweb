import mongoose from "mongoose";
import dns from "node:dns/promises";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI");
}

console.log(
  "MongoDB URI:",
  MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, "//$1:****@"),
);

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
  };
}

export async function connectDB() {
  if (cached.conn) {
    console.log("MongoDB: using cached connection");
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("MongoDB: creating new connection...");

    cached.promise = mongoose.connect(MONGODB_URI, {
      family: 4,
    });
  }

  cached.conn = await cached.promise;

  console.log("MongoDB: connected successfully");

  return cached.conn;
}
