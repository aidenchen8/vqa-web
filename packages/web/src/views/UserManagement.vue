<template>
  <div class="user-management">
    <h2>用户管理</h2>

    <el-table :data="userList" border style="width: 100%">
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="roles" label="角色">
        <template #default="{ row }">
          <el-tag v-for="role in row.roles" :key="role" class="mx-1">
            {{ role }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="handleEdit(row)">
            编辑
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-drawer v-model="drawerVisible" title="编辑用户" size="400px">
      <template #default>
        <el-form v-if="currentUser" label-width="80px">
          <el-form-item label="用户名">
            <span>{{ currentUser.username }}</span>
          </el-form-item>
          <el-form-item label="角色">
            <el-select v-model="currentUser.roles" multiple style="width: 100%">
              <el-option
                v-for="role in validRoles"
                :key="role.value"
                :label="role.label"
                :value="role.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSave"> 保存 </el-button>
          </el-form-item>
        </el-form>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { api } from "../utils/http";
import type { User } from "@/store";

const userList = ref<User[]>([]);
const drawerVisible = ref(false);
const currentUser = ref<User | null>(null);

const validRoles = [
  { label: "管理员", value: "admin" },
  { label: "标注员", value: "annotator" },
  { label: "审核员", value: "reviewer" },
  { label: "普通用户", value: "user" },
];

// 加载用户列表
const loadUsers = async () => {
  try {
    userList.value = (await api.users.getAll()) as any;
  } catch (error) {
    ElMessage.error("加载用户列表失败");
  }
};

// 编辑用户
const handleEdit = (user: User) => {
  currentUser.value = JSON.parse(JSON.stringify(user));
  drawerVisible.value = true;
};

// 保存用户角色
const handleSave = async () => {
  if (!currentUser.value) return;

  try {
    await api.users.updateRoles({
      userId: currentUser.value.id,
      roles: currentUser.value.roles,
    });

    ElMessage.success("更新成功");
    drawerVisible.value = false;
    loadUsers();
  } catch (error) {
    ElMessage.error("更新失败");
  }
};

onMounted(() => {
  loadUsers();
});
</script>
