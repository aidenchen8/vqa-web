import type { UserInfo } from "@/types";
import { ElMessage, ElMessageBox } from "element-plus";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useStore = defineStore("counter", () => {
  const userInfo = ref<UserInfo | undefined>();
  function setUser(user: UserInfo) {
    userInfo.value = user;
  }

  function logout() {
    ElMessageBox.confirm("确定要退出登录吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    })
      .then(() => {
        userInfo.value = undefined;
        localStorage.removeItem("token");
        localStorage.removeItem("userInfo");
        ElMessage.success("已退出登录");
      })
      .catch(() => {});
  }

  const hasPermission = (permission: string) => {
    return userInfo.value?.roles.includes(permission);
  };

  return { userInfo, setUser, logout, hasPermission };
});
