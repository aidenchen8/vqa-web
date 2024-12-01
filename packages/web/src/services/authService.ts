interface Tokens {
  accessToken: string;
  refreshToken: string;
  expires: string;
  refreshExpires: string;
}

interface User {
  id: string;
  username: string;
  roles: string[];
}

import { api } from "../utils/http";

export class AuthService {
  private static readonly TOKEN_KEY = "tokens";
  private static readonly USER_KEY = "user";

  public static saveTokens(tokens: Tokens) {
    localStorage.setItem(this.TOKEN_KEY, JSON.stringify(tokens));
  }

  public static saveUser(user: User) {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  public static getTokens(): Tokens | null {
    const tokens = localStorage.getItem(this.TOKEN_KEY);
    return tokens ? JSON.parse(tokens) : null;
  }

  public static getUser(): User | null {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  public static clear() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  public static isTokenExpired(): boolean {
    const tokens = this.getTokens();
    if (!tokens) return true;

    const expires = new Date(tokens.expires);
    return expires.getTime() <= Date.now();
  }

  public static async refreshTokenIfNeeded(): Promise<boolean> {
    if (this.isTokenExpired()) {
      const tokens = this.getTokens();
      if (!tokens) return false;

      try {
        const data: any = await api.auth.refreshToken({
          refreshToken: tokens.refreshToken,
        });
        this.saveTokens(data);
        this.saveUser(data.user);
        return true;
      } catch {
        return false;
      }
    }
    return true;
  }

  public static clearAuth() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("tokenExpires");
    localStorage.removeItem("refreshExpires");
    localStorage.removeItem("user");
  }
}
