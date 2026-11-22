import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins/jwt";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { ObjectId } from "mongodb";
import { connectDB, client } from "@/lib/mongodb";

const db = await connectDB();

const betterAuthUrl = process.env.BETTER_AUTH_URL;
if (!betterAuthUrl) {
  throw new Error("BETTER_AUTH_URL is missing");
}

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

export const auth = betterAuth({
  plugins: [
    jwt({
      jwks: {
        jwksPath: "/jwks",
      },
      jwt: {
        issuer: betterAuthUrl,
        audience: "salonbook-api",
      },
    }),
  ],

  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const users = db.collection("users");
          const now = new Date();

          await users.updateOne(
            { email: user.email.toLowerCase() },
            {
              $setOnInsert: {
                _id: new ObjectId(),
                name: user.name,
                email: user.email.toLowerCase(),
                image: user.image ?? "",
                role: "customer",
                isBlocked: false,
                createdAt: user.createdAt ?? now,
                updatedAt: now,
              },
            },
            { upsert: true },
          );
        },
      },
    },
  },

  emailAndPassword: {
    enabled: true,
  },

  ...(googleClientId && googleClientSecret
    ? {
        socialProviders: {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          },
        },
      }
    : {}),

  database: mongodbAdapter(db, {
    client,
  }),
});
