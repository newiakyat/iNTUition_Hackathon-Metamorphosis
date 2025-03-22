'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="text-red-500 mb-4">
        <ShieldAlert size={64} />
      </div>
      <h1 className="text-3xl font-bold mb-2">Unauthorized Access</h1>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        You don&apos;t have permission to access this page. This area requires administrative privileges.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => router.push('/')}>
          Return to Dashboard
        </Button>
        <Button variant="outline" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    </div>
  );
} 