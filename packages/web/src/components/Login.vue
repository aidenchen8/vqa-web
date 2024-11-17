<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <h2>{{ isLoginMode ? "用户登录" : "修改密码" }}</h2>
      </template>

      <!-- 登录表单 -->
      <el-form
        v-if="isLoginMode"
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin">登录</el-button>
          <el-button @click="isLoginMode = false">修改密码</el-button>
        </el-form-item>
      </el-form>

      <!-- 修改密码表单 -->
      <el-form
        v-else
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="passwordForm.username"
            placeholder="请输入用户名"
          />
        </el-form-item>
        <el-form-item label="原密码" prop="oldPassword">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            show-password
            placeholder="请输入原密码"
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            show-password
            placeholder="请输入新密码"
          />
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            show-password
            placeholder="请确认新密码"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleChangePassword"
            >确认修改</el-button
          >
          <el-button @click="isLoginMode = true">返回登录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage, ElForm, ElFormItem, ElButton, ElInput } from "element-plus";

// 添加 emit 定义
const emit = defineEmits<{
  (e: "loginSuccess"): void;
}>();

// 控制显示登录还是修改密码表单
const isLoginMode = ref(true);

// 登录表单
const loginFormRef = ref<FormInstance>();
const loginForm = reactive({
  username: "",
  password: "",
});

// 修改密码表单
const passwordFormRef = ref<FormInstance>();
const passwordForm = reactive({
  username: "",
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});

// 表单验证规则
const loginRules: FormRules = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }],
};

const passwordRules: FormRules = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  oldPassword: [{ required: true, message: "请输入原密码", trigger: "blur" }],
  newPassword: [
    { required: true, message: "请输入新密码", trigger: "blur" },
    { min: 6, message: "密码长度不能小于6位", trigger: "blur" },
  ],
  confirmPassword: [
    { required: true, message: "请确认新密码", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error("两次输入的密码不一致"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
};

// 登录处理
const handleLogin = async () => {
  if (!loginFormRef.value) return;
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const response = await fetch("http://localhost:3000/api/users/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(loginForm),
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem("token", data.token);
          ElMessage.success("登录成功");
          emit("loginSuccess");
        } else {
          ElMessage.error(data.message || "登录失败");
        }
      } catch (error) {
        ElMessage.error("服务器错误");
      }
    }
  });
};

// 修改密码处理
const handleChangePassword = async () => {
  if (!passwordFormRef.value) return;
  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const response = await fetch(
          "http://localhost:3000/api/users/change-password",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(passwordForm),
          }
        );

        const data = await response.json();

        if (response.ok) {
          ElMessage.success("密码修改成功");
          isLoginMode.value = true;
          passwordFormRef.value?.resetFields();
        } else {
          ElMessage.error(data.message || "修改密码失败");
        }
      } catch (error) {
        ElMessage.error("服务器错误");
      }
    }
  });
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-card {
  width: 480px;
}

.el-button {
  margin-right: 10px;
}
</style>
