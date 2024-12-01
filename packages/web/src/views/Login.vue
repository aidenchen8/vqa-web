<template>
  <div class="login-page">
    <el-card>
      <div class="login-header">{{ title }}</div>
      <Register v-if="status === 'register'" @switch-login="status = 'login'" />
      <Login v-else @switch-register="status = 'register'" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import Login from "@/components/Login.vue";
import Register from "@/components/Register.vue";
type PageType = "login" | "register";
const status = ref<PageType>("login");
const title = computed(() => {
  switch (status.value) {
    case "login":
      return "用户登录";
    case "register":
      return "用户注册";
    default:
      return "用户登录";
  }
});
</script>

<style lang="scss">
.login-page {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  .login-header {
    font-size: 20px;
    margin-bottom: 20px;
  }
}
</style>
