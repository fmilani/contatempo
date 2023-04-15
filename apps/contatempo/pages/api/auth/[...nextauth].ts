import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  debug: true,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    signIn: async function ({ user }) {
      console.log("signing in...");
      const res = await fetch(`${process.env.BACKEND_URL}/login`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({ user }),
      });
      user.accessToken = await res.json();
      console.log("signed in!");
      return true;
    },
    jwt: async function ({ token, user }) {
      console.log("jwt callback");
      if (user) {
        token.accessToken = user.accessToken;
      }
      return token;
    },
    session: async function ({ session, token }) {
      console.log("session callback");
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
};

export default NextAuth(authOptions);
