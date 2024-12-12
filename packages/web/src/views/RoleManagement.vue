<!-- <template>
  <div class="role-management">
    <h2>角色管理</h2>

    <el-row :gutter="20">
      <el-col v-for="role in roleList" :key="role.name" :span="6">
        <el-card class="role-card">
          <template #header>
            <div class="card-header">
              <span>{{ role.label }}</span>
              <el-button
                type="primary"
                size="small"
                @click="openUserSelector(role)"
              >
                管理用户
              </el-button>
            </div>
          </template>
          <div class="user-list">
            <el-tag
              v-for="user in role.users"
              :key="user.id"
              closable
              @close="removeUserFromRole(role.name, user.id)"
            >
              {{ user.username }}
            </el-tag>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog
      v-model="dialogVisible"
      :title="`选择${currentRole?.label || ''}用户`"
      width="50%"
    >
      <el-transfer
        v-model="selectedUsers"
        :data="userList"
        :titles="['可选用户', '已选用户']"
      />
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleBatchUpdate"> 确定 </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { api } from "../utils/http";

const roleList = ref([
  { name: "admin", label: "管理员", users: [] },
  { name: "annotator", label: "标注员", users: [] },
  { name: "reviewer", label: "审核员", users: [] },
  { name: "user", label: "普通用户", users: [] },
]);

const userList = ref([]);
const currentRole = ref(null);
const dialogVisible = ref(false);
const selectedUsers = ref([]);

// 加载角色下的用户
const loadRoleUsers = async (role: string) => {
  try {
    const users = await api.roles.getByRole(role);
    const roleIndex = roleList.value.findIndex((r) => r.name === role);
    if (roleIndex > -1) {
      roleList.value[roleIndex].users = users;
    }
  } catch (error) {
    ElMessage.error("加载用户列表失败");
  }
};

// 批量更新用户角色
const handleBatchUpdate = async () => {
  try {
    await api.users.batchUpdateRoles({
      userIds: selectedUsers.value,
      roles: [currentRole.value.name],
    });

    ElMessage.success("批量更新成功");
    dialogVisible.value = false;
    loadRoleUsers(currentRole.value.name);
  } catch (error) {
    ElMessage.error("批量更新失败");
  }
};

// 打开用户选择对话框
const openUserSelector = (role) => {
  currentRole.value = role;
  selectedUsers.value = [];
  dialogVisible.value = true;
};
</script>

<style scoped>
.role-card {
  margin-bottom: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.user-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style> -->
