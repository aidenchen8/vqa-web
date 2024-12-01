<template>
  <el-form
    ref="formRef"
    :model="passwordForm"
    :rules="rules"
    label-width="100px"
    class="password-form"
  >
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

    <el-form-item label="确认密码" prop="confirmPassword">
      <el-input
        v-model="passwordForm.confirmPassword"
        type="password"
        show-password
        placeholder="请确认新密码"
      />
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="handleSubmit(formRef)">
        确认修改
      </el-button>
      <el-button @click="$emit('cancel')"> 取消 </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage, ElForm, ElFormItem, ElInput, ElButton } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import JSEncrypt from "jsencrypt";

const emit = defineEmits<{
  (e: "password-changed"): void;
  (e: "cancel"): void;
}>();

const formRef = ref<FormInstance>();
const passwordForm = ref({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const rules = ref<FormRules>({
  oldPassword: [
    { required: true, message: "请输入原密码", trigger: "blur" },
    { min: 6, message: "密码长度不能小于6位", trigger: "blur" },
  ],
  newPassword: [
    { required: true, message: "请输入新密码", trigger: "blur" },
    { min: 6, message: "密码长度不能小于6位", trigger: "blur" },
  ],
  confirmPassword: [
    { required: true, message: "请确认新密码", trigger: "blur" },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (value !== passwordForm.value.newPassword) {
          callback(new Error("两次输入的密码不一致"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
});

const publicKey = ref("");
const encryptor = new JSEncrypt();

// 获取公钥
const getPublicKey = async () => {
  try {
    const response = await fetch("http://localhost:3000/api/users/public-key");
    const data = await response.json();
    publicKey.value = data.publicKey;
    encryptor.setPublicKey(publicKey.value);
  } catch (error) {
    console.error("获取公钥失败:", error);
  }
};

onMounted(() => {
  getPublicKey();
});

const handleSubmit = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;

  await formEl.validate(async (valid) => {
    if (valid) {
      try {
        // 加密密码
        const oldEncryptedPassword = encryptor.encrypt(
          passwordForm.value.oldPassword
        );
        const newEncryptedPassword = encryptor.encrypt(
          passwordForm.value.newPassword
        );

        const response = await fetch(
          "http://localhost:3000/api/users/change-password",
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              oldEncryptedPassword,
              newEncryptedPassword,
            }),
          }
        );

        const data = await response.json();

        if (response.ok) {
          ElMessage.success("密码修改成功");
          emit("password-changed");
        } else {
          ElMessage.error(data.message || "密码修改失败");
        }
      } catch (error) {
        console.error("Change password error:", error);
        ElMessage.error("密码修改失败");
      }
    }
  });
};
</script>

<style scoped>
.password-form {
  max-width: 500px;
  margin: 0 auto;
}
</style>
