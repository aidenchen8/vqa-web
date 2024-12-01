<template>
  <el-form
    ref="formRef"
    :model="registerForm"
    :rules="rules"
    label-width="80px"
    status-icon
  >
    <el-form-item label="用户名" prop="username">
      <el-input v-model="registerForm.username" placeholder="请输入用户名" />
    </el-form-item>

    <el-form-item label="密码" prop="password">
      <el-input
        v-model="registerForm.password"
        type="password"
        show-password
        placeholder="请输入密码"
      />
    </el-form-item>

    <el-form-item label="确认密码" prop="confirmPassword">
      <el-input
        v-model="registerForm.confirmPassword"
        type="password"
        show-password
        placeholder="请确认密码"
      />
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="handleRegister(formRef)">
        注册
      </el-button>
      <el-button @click="$emit('switchLogin')"> 返回登录 </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ElMessage } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { initPublicKey } from "@/utils/authHooks";
import { api } from "@/utils/http";
import { AuthService } from "@/services/authService";

const emit = defineEmits<{
  (e: "switchLogin"): void;
}>();

const formRef = ref<FormInstance>();
const registerForm = ref({
  username: "",
  password: "",
  confirmPassword: "",
});

// 表单验证规则
const validatePass = (rule: any, value: string, callback: any) => {
  if (value === "") {
    callback(new Error("请输入密码"));
  } else if (value.length < 6) {
    callback(new Error("密码长度不能小于6位"));
  } else {
    if (registerForm.value.confirmPassword !== "") {
      if (!formRef.value) return;
      formRef.value.validateField("confirmPassword");
    }
    callback();
  }
};

const validatePass2 = (rule: any, value: string, callback: any) => {
  if (value === "") {
    callback(new Error("请再次输入密码"));
  } else if (value !== registerForm.value.password) {
    callback(new Error("两次输入密码不一致!"));
  } else {
    callback();
  }
};

const rules = ref<FormRules>({
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 3, max: 20, message: "长度在 3 到 20 个字符", trigger: "blur" },
  ],
  password: [{ required: true, validator: validatePass, trigger: "blur" }],
  confirmPassword: [
    { required: true, validator: validatePass2, trigger: "blur" },
  ],
});

const { encrypt } = initPublicKey();

const handleRegister = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;

  await formEl.validate(async (valid) => {
    if (valid) {
      try {
        // 加密密码
        const encryptedPassword = encrypt(registerForm.value.password);
        if (!encryptedPassword) {
          ElMessage.error("密码加密失败");
          return;
        }

        const response = await api.auth.register({
          username: registerForm.value.username,
          encryptedPassword,
        });

        // 可以选择是否自动登录
        AuthService.saveTokens({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          expires: response.expires,
          refreshExpires: response.refreshExpires,
        });
        AuthService.saveUser(response.user);

        ElMessage.success("注册成功");
        emit("switchLogin");
      } catch (error: any) {
        if (error.response?.status === 400) {
          ElMessage.error("用户名已存在");
        } else {
          console.error("Registration error:", error);
          ElMessage.error("注册失败");
        }
      }
    }
  });
};
</script>

<style scoped>
.el-form {
  max-width: 400px;
  margin: 0 auto;
}
</style>
