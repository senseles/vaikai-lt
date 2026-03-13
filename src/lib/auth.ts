import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '@/lib/prisma';
import { verifyPassword, hashPassword, needsRehash } from '@/lib/password';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // Google OAuth
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    // Facebook OAuth
    ...(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET
      ? [
          FacebookProvider({
            clientId: process.env.FACEBOOK_APP_ID,
            clientSecret: process.env.FACEBOOK_APP_SECRET,
          }),
        ]
      : []),
    // Credentials (existing email/password)
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'El. paštas', type: 'email' },
        password: { label: 'Slaptažodis', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.passwordHash) return null;

        const valid = verifyPassword(credentials.password, user.passwordHash);
        if (!valid) return null;

        // Rehash legacy passwords
        if (needsRehash(user.passwordHash)) {
          const newHash = hashPassword(credentials.password);
          await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash: newHash },
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  session: {
    // Use JWT for credentials provider compatibility
    strategy: 'jwt',
  },
  pages: {
    signIn: '/prisijungti',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
