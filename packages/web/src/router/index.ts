import { ElMessage } from "element-plus";
import { createMemoryHistory, createRouter } from "vue-router";
import { AuthService } from "../services/authService";
import { useStore } from "@/store";

const routes = [
  {
    path: "/",
    component: () => import("@/views/Home.vue"),
    redirect: "/vqa",
    meta: { auth: "user" },
    children: [
      {
        path: "/vqa",
        component: () => import("@/views/VQA.vue"),
        meta: { auth: "user" },
      },
    ],
  },
  { path: "/login", component: () => import("@/views/Login.vue") },
  {
    path: "/user-manage",
    component: () => import("@/views/UserManagement.vue"),
    meta: {
      auth: "admin",
    },
  },
];

const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 检查是否需要登录
  if (to.matched.some((record) => record.meta.auth)) {
    // 检查登录状态和token有效性
    const isAuthenticated = await AuthService.refreshTokenIfNeeded();

    if (!isAuthenticated) {
      ElMessage.warning("请先登录");
      next({
        path: "/login",
        query: { redirect: to.fullPath }, // 保存原目标路径
      });
      return;
    }

    // TODO: 检查用户信息
    const store = useStore();
    if (!store.userInfo) {
    }
  }

  next();
});

// 路由错误处理
router.onError((error) => {
  console.error("路由错误:", error);
  router.push("/");
});

export default router;
