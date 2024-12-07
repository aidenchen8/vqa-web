import ky from "ky";
import { AuthService } from "../services/authService";
import router from "../router";
import type {
  UserInfo,
  LoginResponse,
  RegisterData,
  RegisterResponse,
  UpdateRolesData,
  BatchUpdateRolesData,
  ChangePasswordData,
  FormStats,
  FormQueryResponse,
  LastEditedResponse,
  SaveFormData,
  SaveFormResponse,
  CSVUploadData,
  CSVUploadResponse,
  CSVCheckResponse,
  CSVDataResponse,
} from "@/types";

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
          AuthService.logout();
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
          AuthService.logout();
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

// API 接口定义
export const api = {
  // 认证相关
  auth: {
    getPublicKey: () =>
      publicRequest.get("users/public-key").json<{ publicKey: string }>(),

    login: (data: { username: string; encryptedPassword: string }) =>
      publicRequest.post("users/login", { json: data }).json<LoginResponse>(),

    refreshToken: (data: { refreshToken: string }) =>
      http.post("users/refresh-token", { json: data }).json<LoginResponse>(),

    logout: () => http.post("users/logout").json<{ message: string }>(),

    register: (data: RegisterData) =>
      publicRequest
        .post("users/register", { json: data })
        .json<RegisterResponse>(),
  },

  // 用户相关
  users: {
    getAll: () => http.get("users/all").json<UserInfo[]>(),

    getInfo: () => http.get("users/info").json<UserInfo>(),

    updateRoles: (data: UpdateRolesData) =>
      http.put("users/update-roles", { json: data }).json<UserInfo>(),

    batchUpdateRoles: (data: BatchUpdateRolesData) =>
      http
        .put("users/batch-update-roles", { json: data })
        .json<{ message: string }>(),

    changePassword: (data: ChangePasswordData) =>
      http
        .put("users/change-password", { json: data })
        .json<{ message: string }>(),
  },

  // 表单相关
  form: {
    getStats: () => http.get("form/stats").json<FormStats>(),

    queryByFileName: (imageFileName: string) =>
      http
        .get(`form/query?imageFileName=${imageFileName}`)
        .json<FormQueryResponse>(),

    queryByQuestionId: (questionId: number) =>
      http.get(`form/query?questionId=${questionId}`).json<FormQueryResponse>(),

    getLastEdited: () =>
      http.get("form/last-edited").json<LastEditedResponse>(),

    save: (data: SaveFormData) =>
      http.post("form/save", { json: data }).json<SaveFormResponse>(),
  },

  // CSV相关
  csv: {
    check: () => http.get("csv/check").json<CSVCheckResponse>(),

    upload: (data: CSVUploadData) =>
      http.post("csv/upload", { json: data }).json<CSVUploadResponse>(),

    getData: () => http.get("csv/data").json<CSVDataResponse>(),
  },
};

export default http;
