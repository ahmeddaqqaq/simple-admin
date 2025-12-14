import { OpenAPI } from './api';

// Set the base URL immediately
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
OpenAPI.BASE = apiUrl;
OpenAPI.WITH_CREDENTIALS = true;
OpenAPI.TOKEN = async () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    return token || '';
  }
  return '';
};

export function configureAPI() {
  console.log('Configuring API with BASE URL:', apiUrl);
  OpenAPI.BASE = apiUrl;
  OpenAPI.WITH_CREDENTIALS = true;
  OpenAPI.TOKEN = async () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      return token || '';
    }
    return '';
  };
  console.log('API configured. OpenAPI.BASE is now:', OpenAPI.BASE);
}

// Initialize API configuration immediately on client
if (typeof window !== 'undefined') {
  configureAPI();
}

export function setAuthToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', token);
  }
}

export function removeAuthToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  return null;
}

export function getRefreshToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('refreshToken');
  }
  return null;
}

export function setTokens(accessToken: string, refreshToken: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }
}
