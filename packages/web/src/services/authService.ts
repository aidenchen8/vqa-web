import JSEncrypt from "jsencrypt";
import { useStore } from "@/store";
import { api } from "@/utils/http";
import type { UserInfo } from "@/types";

interface Tokens {
  accessToken: string;
  refreshToken: string;
  expires: string;
  refreshExpires: string;
}

const TOKEN_KEY = "tokens";
const USER_KEY = "user";

export class AuthService {
  public static initPublicKey() {
    const encryptor = new JSEncrypt();

    const fetchPublicKey = async () => {
      try {
        const response = await api.auth.getPublicKey();
        encryptor.setPublicKey(response.publicKey);
      } catch (error) {
        console.error("获取公钥失败:", error);
      }
    };

    fetchPublicKey();

    const encrypt = (text: string) => {
      const encrypted = encryptor.encrypt(text);
      if (!encrypted) {
        throw new Error("加密失败");
      }
      // 确保返回的是 base64 字符串
      return encrypted;
    };

    return { encrypt };
  }

  public static saveTokens(tokens: Tokens) {
    localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
  }

  public static saveUser(user: UserInfo) {
    const store = useStore();
    store.userInfo = user;
  }

  public static getTokens(): Tokens | null {
    const tokens = localStorage.getItem(TOKEN_KEY);
    return tokens ? JSON.parse(tokens) : null;
  }

  public static async getUser(): Promise<UserInfo | undefined> {
    const response = await api.users.getInfo();
    this.saveUser(response);
    return response;
  }

  public static async logout(redirectUrl?: string) {
    try {
      await api.auth.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      debugger;
      localStorage.removeItem(TOKEN_KEY);
      window.location.replace(redirectUrl || window.location.origin);
    }
  }

  public static isTokenExpired(): boolean {
    const tokens = this.getTokens();
    if (!tokens?.accessToken) return true;
    const now = Date.now();
    return now - Number(tokens.expires) > 0;
  }

  public static async refreshTokenIfNeeded(): Promise<boolean> {
    if (this.isTokenExpired()) {
      const tokens = this.getTokens();
      if (!tokens) return false;

      try {
        const data = await api.auth.refreshToken({
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
}
