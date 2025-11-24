'use client';

import React, { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        password,
        redirect: false,
        callbackUrl: '/admin',
      });

      if (result?.error) {
        setError('Invalid password');
      } else if (result?.ok) {
        // Redirect to admin panel on successful login
        router.push('/admin');
        router.refresh(); // Force a refresh to update the session
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[var(--accent-bronze)] to-[var(--accent-malachite)] rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">T</span>
              </div>
              <CardTitle>Admin Login</CardTitle>
              <p className="text-[var(--text-secondary)] mt-2">
                Enter your password to access the admin panel
              </p>
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                type="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                error={error}
                required
              />
              
              <Button
                type="submit"
                variant="bronze"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
