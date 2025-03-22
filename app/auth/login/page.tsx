'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loginStatus, setLoginStatus] = useState<string>('');
  const { signIn, user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Add debug logging
  useEffect(() => {
    console.log("Login page auth state:", { user, authLoading });
    
    if (user) {
      console.log("User is logged in, redirecting to dashboard");
      setLoginStatus('Redirecting to dashboard...');
      setTimeout(() => {
        router.push('/');
      }, 1000);
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    setLoginStatus('Attempting to sign in...');

    try {
      console.log("Submitting login with:", email);
      const { error } = await signIn(email, password);
      
      if (error) {
        console.error("Login error:", error);
        setError(error.message);
        setLoginStatus('Login failed');
      } else {
        console.log("Login successful");
        setLoginStatus('Login successful! Redirecting...');
        router.push('/');
      }
    } catch (err: any) {
      console.error("Exception during login:", err);
      setError(err.message || 'An error occurred during sign in');
      setLoginStatus('Error during login');
    } finally {
      setIsLoading(false);
    }
  };

  // Added a demo login function for quick testing
  const handleDemoLogin = async () => {
    setError(null);
    setIsLoading(true);
    setLoginStatus('Using demo login...');

    try {
      console.log("Using demo login with admin@admin.com");
      const { error } = await signIn('admin@admin.com', 'password123');
      
      if (error) {
        console.error("Demo login error:", error);
        setError(error.message);
        setLoginStatus('Demo login failed');
      } else {
        console.log("Demo login successful");
        setLoginStatus('Demo login successful! Redirecting...');
        router.push('/');
      }
    } catch (err: any) {
      console.error("Exception during demo login:", err);
      setError(err.message || 'An error occurred during sign in');
      setLoginStatus('Error during demo login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Sign in to your account</CardTitle>
          <CardDescription className="text-center">
            Enter your email and password to sign in
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {loginStatus && (
            <div className="mb-4 text-sm text-center text-muted-foreground">
              Status: {loginStatus}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/auth/forgot-password" className="text-sm font-medium text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || authLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <Button 
              variant="outline" 
              onClick={handleDemoLogin} 
              disabled={isLoading || authLoading} 
              className="w-full"
            >
              {isLoading ? 'Signing in...' : 'Demo Login (Admin)'}
            </Button>
          </div>
          
          {/* Debug information */}
          <div className="mt-4 text-xs text-muted-foreground p-2 border rounded">
            <p>Auth loading: {authLoading ? 'Yes' : 'No'}</p>
            <p>User: {user ? user.email : 'Not logged in'}</p>
          </div>
        </CardContent>
        <CardFooter>
          <div className="text-center text-sm w-full">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 