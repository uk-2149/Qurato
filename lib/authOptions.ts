import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import type { User as NextAuthUser } from "next-auth";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.hashedPassword) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          imageUrl: user.imageUrl,
        } as NextAuthUser;
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle Google OAuth - create user if doesn't exist
      if (account?.provider === "google" && user.email) {
        let dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: {
              email: user.email,
              name: user.name || profile?.name || "",
              imageUrl: user.image || profile?.image || "",
            },
          });
        }

        // Ensure the user object has the database ID
        user.id = dbUser.id;
      }

      return true;
    },

    async jwt({ token, user, trigger, account }) {
      // Initial sign in - set user data
      if (user && user.id) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.imageUrl = user.imageUrl;
      }

      // For Google OAuth or when token.id is not a valid MongoDB ObjectId
      // Always fetch from database to ensure we have the correct MongoDB ID
      if (
        token.email &&
        (!token.id || !/^[0-9a-fA-F]{24}$/.test(token.id as string))
      ) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.email = dbUser.email;
          token.name = dbUser.name;
          token.imageUrl = dbUser.imageUrl || undefined;
        }
      }

      // Handle updates
      if (trigger === "update" && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
        });

        if (dbUser) {
          token.name = dbUser.name;
          token.email = dbUser.email;
          token.imageUrl = dbUser.imageUrl || undefined;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image =
          (token.imageUrl as string) || (token.image as string);
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NA_SECRET,
};
