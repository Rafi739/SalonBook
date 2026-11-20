import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins/jwt";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
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