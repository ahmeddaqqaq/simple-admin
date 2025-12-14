"use client";

import { useEffect } from 'react';
import { configureAPI } from '@/lib/apiConfig';

export function ApiConfigInitializer() {
  useEffect(() => {
    // Ensure API is configured on client mount
    configureAPI();
  }, []);

  return null;
}
