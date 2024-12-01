import ky from "ky";
import { AuthService } from "../services/authService";
import router from "../router";

// API 接口类型定义
interface RegisterData {
  username: string;
  encryptedPassword: string;
}

interface RegisterResponse {
  user: {
    id: string;
    username: string;
    roles: string[];
  };
  accessToken: string;
  refreshToken: string;
  expires: string;
  refreshExpires: string;
}

const prefixUrl = "http://localhost:3000/api";

// 创建 ky 实例
const http = ky.create({
  prefixUrl,
  timeout: 30000,
  hooks: {
    beforeRequest: [
      async (request) => {
        // 检查并刷新token
        const isValid = await AuthService.refreshTokenIfNeeded();
        if (!isValid) {
          AuthService.clear();
          router.push("/login");
          throw new Error("认证已过期");
        }

        const tokens = AuthService.getTokens();
        if (tokens) {
          request.headers.set("Authorization", `Bearer ${tokens.accessToken}`);
        }
      },
    ],
    afterResponse: [
      async (request, options, response) => {
        if (response.status === 401) {
          const responseData: any = await response.json();
          if (responseData.code === "TOKEN_EXPIRED") {
            // Token 过期，尝试刷新
            const isValid = await AuthService.refreshTokenIfNeeded();
            if (isValid) {
              // 重试原请求
              const tokens = AuthService.getTokens();
              request.headers.set(
                "Authorization",
                `Bearer ${tokens?.accessToken}`
              );
              return ky(request);
            }
          }
          // 其他认证错误，清除状态并跳转登录
          AuthService.clear();
          router.push("/login");
        }
        return response;
      },
    ],
  },
});

const publicRequest = ky.create({
  prefixUrl,
  timeout: 30000,
});

// 请求方法封装
export const api = {
  // 认证相关
  auth: {
    getPublicKey: () => publicRequest.get("users/public-key").json(),
    login: (data: any) =>
      publicRequest.post("users/login", { json: data }).json(),
    refreshToken: (data: any) =>
      http.post("users/refresh-token", { json: data }).json(),
    logout: () => http.post("users/logout").json(),
    register: (data: RegisterData) =>
      publicRequest
        .post("users/register", { json: data })
        .json<RegisterResponse>(),
  },

  // 用户相关
  users: {
    getAll: () => http.get("users/all").json(),
    getInfo: () => http.get("users/info").json(),
    updateRoles: (data: any) =>
      http.put("users/update-roles", { json: data }).json(),
    batchUpdateRoles: (data: any) =>
      http.put("users/batch-update-roles", { json: data }).json(),
    changePassword: (data: any) =>
      http.put("users/change-password", { json: data }).json(),
  },

  // 角色相关
  roles: {
    getByRole: (role: string) => http.get(`users/by-role/${role}`).json(),
  },
};

export default http;
