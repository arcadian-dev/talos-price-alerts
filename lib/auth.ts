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
        console.log('Admin password configured:', !!adminPassword);
        console.log('Admin password length:', adminPassword.length);

        // For development, allow plain text comparison
        // In production, you should hash the password in the environment variable
        let isValidPassword = false;
        
        try {
          // First try plain text comparison
          if (credentials.password === adminPassword) {
            isValidPassword = true;
            console.log('Plain text password match');
          } else {
            // Then try bcrypt comparison (in case password is hashed)
            isValidPassword = await bcrypt.compare(credentials.password, adminPassword);
            console.log('Bcrypt comparison result:', isValidPassword);
          }
        } catch (error) {
          console.error('Password comparison error:', error);
          return null;
        }

        if (isValidPassword) {
          console.log('Login successful for admin');
          return {
            id: 'admin',
            email: 'admin@talos.com',
            name: 'Admin',
            role: 'admin',
          };
        }

        console.log('Login failed - invalid password');
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
        session.user.id = token.sub || '';
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
