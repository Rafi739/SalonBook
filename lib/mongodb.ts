import * as dns from "node:dns";
import { isIP } from "node:net";
import { MongoClient, type Db } from "mongodb";

const dnsServersValue = process.env.MONGODB_DNS_SERVERS;

if (dnsServersValue !== undefined) {
  const dnsServers = dnsServersValue.split(",").map((server) => server.trim());

  if (
    dnsServers.length === 0 ||
    dnsServers.some((server) => server.length === 0 || isIP(server) === 0)
  ) {
    throw new Error(
      "Invalid MONGODB_DNS_SERVERS: expected a comma-separated list of valid IPv4 or IPv6 addresses."
    );
  }

  try {
    dns.promises.setServers(dnsServers);
  } catch (error) {
    throw new Error("Unable to configure DNS servers from MONGODB_DNS_SERVERS.", {
      cause: error,
    });
  }
}

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is missing");
}

const client = new MongoClient(uri);

let connectionPromise: Promise<MongoClient> | null = null;

export async function connectDB(): Promise<Db> {
  try {
    if (!connectionPromise) {
      connectionPromise = client.connect().catch((error: unknown) => {
        connectionPromise = null;
        throw error;
      });
    }

    await connectionPromise;
    return client.db(process.env.MONGODB_DATABASE || "salonbook");
  } catch (error) {
    console.error(
      "MongoDB Connection Failed:",
      error instanceof Error ? error.name : "Unknown error",
    );
    throw error;
  }
}

export { client };