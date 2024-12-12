<template>
  <el-form :model="loginForm" label-width="80px" @keyup.enter="handleLogin">
    <el-form-item label="用户名" required>
      <el-input v-model="loginForm.username" />
    </el-form-item>
    <el-form-item label="密码" required>
      <el-input v-model="loginForm.password" type="password" show-password />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="handleLogin"> 登录 </el-button>
      <el-button @click="$emit('switchRegister')"> 注册账号 </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import { AuthService } from "@/services/authService";
import { api } from "@/utils/http";

defineEmits(["switchRegister"]);

const router = useRouter();
const loginForm = ref({
  username: "",
  password: "",
});

const { encrypt } = AuthService.initPublicKey();

const handleLogin = async () => {
  try {
    const encryptedPassword = encrypt(loginForm.value.password);

    const data = await api.auth.login({
      username: loginForm.value.username,
      encryptedPassword,
    });
    console.log("login", data);

    // 保存认证信息
    AuthService.saveTokens(data);
    AuthService.saveUser(data.user);

    ElMessage.success("登录成功");
    router.push("/");
  } catch (error) {
    console.error("Login error:", error);
    ElMessage.error("登录失败");
  }
};
</script>
