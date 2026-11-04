import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { jwt } from "better-auth/plugins";

const client = new MongoClient(process.env.MONGO_URI as string);

const db = client.db("Social-Bridge");

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client,
  }),

  emailAndPassword: {
    enabled: true,
    // Matches better-auth's own default and the live rules on /signup —
    // 6 characters is below the OWASP/NIST minimum of 8.
    minPasswordLength: 8,
  },
  account: {
  accountLinking: {
    enabled: true,
    trustedProviders: ["google"],
  },
},

  socialProviders: {
    google: {
      clientId: process.env.BETTER_AUTH_GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.BETTER_AUTH_GOOGLE_CLIENT_SECRET as string,
    },
  },

 plugins: [
  jwt({
    sessionCookieCache: true,
  }),
],

session: {
  cookieCache: {
    enabled: true,
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
},
});