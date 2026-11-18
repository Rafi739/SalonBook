import { MongoClient } from "mongodb";
import dns from "node:dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is missing");
}

const client = new MongoClient(uri);

let isConnected = false;

export async function connectDB() {
  try {
    if (!isConnected) {
      await client.connect();
      isConnected = true;
    }

    const db = client.db(
      process.env.MONGODB_DATABASE || "salonbook"
    );

    return db;
  } catch (error) {
    console.error("MongoDB Connection Failed:", error);
    throw error;
  }
}

export { client };