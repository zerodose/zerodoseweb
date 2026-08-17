// import mongoose from "mongoose";
// import dns from "node:dns/promises";

// dns.setServers(["1.1.1.1", "8.8.8.8"]);

// const MONGODB_URI = process.env.MONGODB_URI;

// if (!MONGODB_URI) {
//   throw new Error("Please define MONGODB_URI");
// }

// console.log(
//   "MongoDB URI:",
//   MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, "//$1:****@"),
// );

// let cached = global.mongoose;

// if (!cached) {
//   cached = global.mongoose = {
//     conn: null,
//     promise: null,
//   };
// }

// export async function connectDB() {
//   if (cached.conn) {
//     console.log("MongoDB: using cached connection");
//     return cached.conn;
//   }

//   if (!cached.promise) {
//     console.log("MongoDB: creating new connection...");

//     cached.promise = mongoose.connect(MONGODB_URI, {
//       family: 4,
//     });
//   }

//   cached.conn = await cached.promise;

//   console.log("MongoDB: connected successfully");

//   return cached.conn;
// }

import mongoose from "mongoose";
import dns from "node:dns/promises";

// ============================================================
// DNS
// ============================================================

dns.setServers(["1.1.1.1", "8.8.8.8"]);

// ============================================================
// MongoDB URI
// ============================================================

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI");
}

// ============================================================
// Hide password from logs
// ============================================================

console.log(
  "MongoDB URI:",
  MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, "//$1:****@"),
);

// ============================================================
// Global MongoDB Cache
// ============================================================

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
  };
}

// ============================================================
// Connect DB
// ============================================================

export async function connectDB() {
  // ==========================================================
  // Already connected
  // ==========================================================

  if (cached.conn) {
    console.log("MongoDB: using existing connection");

    return cached.conn;
  }

  // ==========================================================
  // Connection is already being created
  // ==========================================================

  if (cached.promise) {
    console.log("MongoDB: waiting for existing connection");

    cached.conn = await cached.promise;

    return cached.conn;
  }

  // ==========================================================
  // Create new connection
  // ==========================================================

  console.log("MongoDB: creating new connection...");

  cached.promise = mongoose.connect(MONGODB_URI, {
    family: 4,
  });

  try {
    cached.conn = await cached.promise;

    console.log("MongoDB: connected successfully");

    return cached.conn;
  } catch (error) {
    // ========================================================
    // Connection failed
    //
    // Important:
    // Reset promise so next request can try again.
    // ========================================================

    cached.promise = null;
    cached.conn = null;

    console.error("MongoDB connection failed:", error);

    throw error;
  }
}
