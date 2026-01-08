// Auth.js v5 Configuration
// Handles authentication with Google OAuth and Prisma database

import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/db/prisma';

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async session({ session, user }) {
      // Add user ID to session (using database sessions now)
      if (user && session.user) {
        session.user.id = user.id;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Redirect to dashboard after sign in
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/dashboard`;
    },
  },
  events: {
    async createUser({ user }) {
      // Create default subscription and preferences for new users
      if (user.id) {
        await prisma.subscription.create({
          data: {
            userId: user.id,
            tier: 'FREE',
            status: 'ACTIVE',
          },
        });
        await prisma.userPreferences.create({
          data: {
            userId: user.id,
          },
        });
      }
    },
  },
  trustHost: true,
});

// Type augmentation for session
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
