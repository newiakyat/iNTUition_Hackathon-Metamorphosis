'use client';

import { useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  
  // Automatically redirect to resources page
  useEffect(() => {
    router.push('/admin/resources');
  }, [router]);

  return (
    <ProtectedRoute adminOnly={true}>
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Redirecting to resources...</p>
                </div>
      </div>
    </ProtectedRoute>
  );
} 