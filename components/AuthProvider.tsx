"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '@/lib/services/auth.service';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Don't check auth on login page
      if (pathname === '/') {
        setIsChecking(false);
        return;
      }

      // Check if user is authenticated
      if (!authService.isAuthenticated()) {
        router.replace('/');
        return;
      }

      // Check if token needs refresh
      const token = localStorage.getItem('accessToken');
      if (token && authService.shouldRefreshToken(token)) {
        try {
          await authService.refreshTokens();
        } catch (error) {
          console.error('Token refresh failed:', error);
          // If refresh fails, redirect to login
          authService.logout();
          router.replace('/');
          return;
        }
      }

      setIsChecking(false);
    };

    checkAuth();
  }, [pathname, router]);

  useEffect(() => {
    // Set up periodic token refresh check (every 4 minutes)
    const interval = setInterval(async () => {
      if (pathname === '/') return;

      const token = localStorage.getItem('accessToken');
      if (token && authService.shouldRefreshToken(token)) {
        try {
          await authService.refreshTokens();
        } catch (error) {
          console.error('Periodic token refresh failed:', error);
          authService.logout();
          router.replace('/');
        }
      }
    }, 4 * 60 * 1000); // 4 minutes

    return () => clearInterval(interval);
  }, [pathname, router]);

  // Show nothing while checking auth (except on login page)
  if (isChecking && pathname !== '/') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
