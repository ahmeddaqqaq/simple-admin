import { AuthenticationService } from '@/lib/api';
import { setTokens, removeAuthToken, getRefreshToken } from '@/lib/apiConfig';
import { BaseService } from './base-service';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  admin?: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export class AuthService extends BaseService {
  async loginAdmin(username: string, password: string): Promise<LoginResponse> {
    const response = await this.handleRequest<LoginResponse>(
      AuthenticationService.authControllerLoginAdmin({ username, password })
    );

    // Store tokens
    setTokens(response.accessToken, response.refreshToken);

    return response;
  }

  async refreshTokens(): Promise<LoginResponse> {
    const response = await this.handleRequest<LoginResponse>(
      AuthenticationService.authControllerRefreshTokens()
    );

    // Update stored tokens
    setTokens(response.accessToken, response.refreshToken);

    return response;
  }

  async logout(): Promise<void> {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        await this.handleRequest<void>(
          AuthenticationService.authControllerLogout({ refreshToken })
        );
      } catch (error) {
        // Ignore logout errors
        console.error('Logout error:', error);
      }
    }

    // Clear local tokens
    removeAuthToken();
  }

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('accessToken');
    return !!token;
  }

  getTokenExpiryTime(token: string): number | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000; // Convert to milliseconds
    } catch {
      return null;
    }
  }

  isTokenExpired(token: string): boolean {
    const expiryTime = this.getTokenExpiryTime(token);
    if (!expiryTime) return true;
    return Date.now() >= expiryTime;
  }

  shouldRefreshToken(token: string): boolean {
    const expiryTime = this.getTokenExpiryTime(token);
    if (!expiryTime) return false;
    // Refresh if token expires in less than 5 minutes
    return Date.now() >= expiryTime - 5 * 60 * 1000;
  }
}

export const authService = new AuthService();
