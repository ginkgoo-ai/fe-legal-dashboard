'use client';

import { Button } from '@/components/ui/button';
import { logout } from '@/service/api';
import { AlertCircle } from 'lucide-react';

export default function AccountInactive() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-background to-muted/20 px-4 py-16 flex items-center justify-center">
      <div className="w-full max-w-lg space-y-8 text-center">
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-yellow-500/10 p-4">
              <AlertCircle className="h-12 w-12 text-yellow-500" />
            </div>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight">Account Inactive</h1>
        </div>

        <div className="space-y-4 text-muted-foreground">
          <p className="text-lg">
            Your account is not activated. Please contact the system administrator for
            activation.
          </p>
          <p className="text-base">
            You can access the system features after activation.
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Try to refresh the page or return to login
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.location.reload()}
              className="cursor-pointer hover:bg-accent transition-colors"
            >
              Refresh Page
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => logout()}
              className="cursor-pointer hover:bg-accent transition-colors"
            >
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
