import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.password) {
          return null;
        }

        const adminPassword = process.env.ADMIN_PASSWORD;
        if (!adminPassword) {
          console.error('ADMIN_PASSWORD environment variable is not set');
          return null;
        }

        console.log('Admin login attempt with password length:', credentials.password.length);

        // For development, allow plain text comparison
        // In production, you should hash the password in the environment variable
        const isValidPassword = credentials.password === adminPassword || 
          await bcrypt.compare(credentials.password, adminPassword);

        if (isValidPassword) {
          return {
            id: 'admin',
            email: 'admin@talos.com',
            name: 'Admin',
            role: 'admin',
          };
        }

        return null;
      }
    })
  ],
  pages: {
    signIn: '/admin/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub;
        session.user.role = token.role;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
