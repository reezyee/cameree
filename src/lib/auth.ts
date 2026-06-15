// src/lib/auth.ts
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
    maxAge: 2 * 60 * 60,
    updateAge: 15 * 60,
  },
  callbacks: {
    async signIn({ user }) {
      const adminEmail = "cameree.io@gmail.com";

      if (user.email === adminEmail) {
        return true;
      }
      return false;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
