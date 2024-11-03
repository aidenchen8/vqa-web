<template>
  <el-page-header title="VQA数据集查看系统" :icon="null">
    <template #content>
      <el-button>查看系统说明</el-button>
    </template>
    <template #extra>
      <div class="flex items-center">
        <el-button>上传文件</el-button>
        <el-button type="primary">保存</el-button>
      </div>
    </template>
  </el-page-header>
  <el-table
    :data="tableData"
    highlight-current-row
    style="width: 100%"
    @current-change="handleCurrentChange"
  >
    <el-table-column type="index" width="50" />
    <el-table-column property="date" label="问题" width="120" />
    <el-table-column property="name" label="翻译" width="120" />
    <el-table-column property="address" label="回答" />
    <el-table-column property="address" label="VG指导" />
    <el-table-column property="address" label="翻译" />
  </el-table>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { ElTable, ElTableColumn, ElPageHeader,ElButton } from 'element-plus'

interface User {
  date: string
  name: string
  address: string
}

const currentRow = ref()

const handleCurrentChange = (val: User | undefined) => {
  currentRow.value = val
}
const tableData: User[] = [
]
</script>
