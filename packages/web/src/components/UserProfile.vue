<template>
  <el-form :model="editForm" label-width="80px">
    <el-form-item label="用户名">
      <el-input v-model="editForm.username" />
    </el-form-item>

    <el-form-item v-if="isAdmin" label="角色">
      <el-select v-model="editForm.roles" multiple allow-create>
        <el-option label="管理员" value="admin" />
        <el-option label="普通用户" value="user" />
        <el-option label="a1" value="a1" />
        <el-option label="a2" value="a2" />
        <el-option label="b1" value="b1" />
        <el-option label="b2" value="b2" />
        <el-option label="c1" value="c1" />
        <el-option label="c2" value="c2" />
        <el-option label="val" value="val" />
      </el-select>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="updateProfile"> 更新信息 </el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { ElMessage } from "element-plus";
import type { UserInfo } from "../types";

const props = defineProps<{
  user: UserInfo;
}>();

const emit = defineEmits<{
  (e: "update", user: any): void;
}>();

const isAdmin = computed(() => props.user.roles.includes("admin"));

// eslint-disable-next-line vue/no-setup-props-destructure
const editForm = ref({
  username: props.user.username,
  roles: props.user.roles,
});

const updateProfile = async () => {
  if (isAdmin.value) updateRoles();
  try {
    const token = localStorage.getItem("token");
    const response = await fetch("http://localhost:3000/api/users/update", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        username: editForm.value.username,
      }),
    });

    const data = await response.json();
    if (response.ok) {
      ElMessage.success("更新成功");
      emit("update", data);
    } else {
      ElMessage.error(data.message || "更新失败");
    }
  } catch (error) {
    ElMessage.error("服务器错误");
  }
};

const updateRoles = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      "http://localhost:3000/api/users/update-roles",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: props.user.id,
          roles: editForm.value.roles,
        }),
      }
    );

    const data = await response.json();
    if (response.ok) {
      ElMessage.success("角色更新成功");
      emit("update", data);
    } else {
      ElMessage.error(data.message || "更新失败");
    }
  } catch (error) {
    ElMessage.error("服务器错误");
  }
};
</script>
