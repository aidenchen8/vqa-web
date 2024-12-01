import JSEncrypt from "jsencrypt";
import { api } from "./http";
import { AuthService } from "@/services/authService";

export const initPublicKey = () => {
  const encryptor = new JSEncrypt();

  const fetchPublicKey = async () => {
    try {
      const response: any = await api.auth.getPublicKey();
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
};

// TODO: 退出登录
export async function logout(redirectUrl: string) {
  try {
    // 调用后端登出接口
    await api.auth.logout();
    // 清除本地存储的认证信息
    AuthService.clearAuth();
    window.location.replace(redirectUrl || window.location.origin);
  } catch (error) {
    console.error("Logout error:", error);
    // 即使后端请求失败，也清除本地认证信息
    AuthService.clearAuth();
    window.location.replace(redirectUrl || window.location.origin);
  }
}
