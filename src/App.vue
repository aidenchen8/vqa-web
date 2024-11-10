<template>
  <el-page-header title="VQA数据集查看系统" :icon="null" style="padding: 16px">
    <template #content>
      <el-button>查看系统说明</el-button>
    </template>
    <template #extra>
      <div class="flex items-center">
        <span
          >{{
            currentFileName
              ?.replace(".jpg", "")
              .replace("_obstacle", "")
              .slice(-16)
          }}&emsp;</span
        >
        <el-input-number
          v-model="num"
          :min="0"
          :max="maxNum"
          @change="updateTableData"
        >
          <template #prefix>
            <span>第</span>
          </template>
          <template #suffix>
            <span>题</span>
          </template>
        </el-input-number>
        <el-upload
          v-model="fileList"
          :limit="1"
          :auto-upload="false"
          :show-file-list="false"
          :on-exceed="handleExceed"
          style="margin: 0 16px"
        >
          <template #trigger>
            <el-button @click="handleUpload">{{
              fileList.length ? fileList[0].name : "上传文件"
            }}</el-button>
          </template>
        </el-upload>
        <el-button type="primary">保存</el-button>
      </div>
    </template>
  </el-page-header>
  <div class="flex">
    <el-card style="width: 400px">
      <el-form ref="formRef" :model="formData" label-width="50px">
        <el-form-item label="Q:" prop="question">
          <el-input v-model="formData.question" type="textarea"></el-input>
        </el-form-item>
        <el-form-item label="A:" prop="answer">
          <el-input v-model="formData.answer" type="textarea"></el-input>
        </el-form-item>
        <el-form-item label="VG:" prop="vgGuide">
          <el-input v-model="formData.vgGuide" type="textarea"></el-input>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card style="margin-left: 16px">
      <el-table :data="tableData" style="width: 100%">
        <el-table-column type="index" width="50" />
        <el-table-column property="question" label="问题" min-width="280">
          <template #default="scope">
            <el-link
              :type="
                currentRow?.question === scope.row.question
                  ? 'primary'
                  : 'default'
              "
              :underline="false"
              @click="handleCurrentChange(scope.row)"
            >
              {{ scope.row.question }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column
          property="questionTranslation"
          label="翻译"
          min-width="200"
        />
        <el-table-column property="answer" label="回答" min-width="200" />
        <el-table-column property="vgGuide" label="VG指导" min-width="280" />
        <el-table-column
          property="vgGuideTranslation"
          label="翻译"
          min-width="200"
        />
      </el-table>
    </el-card>
  </div>
  <el-card style="margin-top: 16px"> </el-card>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import {
  ElTable,
  ElTableColumn,
  ElPageHeader,
  ElButton,
  ElUpload,
  ElMessageBox,
  ElInputNumber,
  ElLink,
  ElForm,
  ElFormItem,
  ElInput,
  ElCard,
} from "element-plus";
import type { UploadProps } from "element-plus";
import Papa from "papaparse";

// 上传文件
const fileList = ref<File[]>([]);

function handleUpload(e: Event) {
  if (fileList.value.length > 0) {
    e.preventDefault();
    e.stopPropagation();
    ElMessageBox.confirm("是否删除当前文件？", "警告", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }).then(() => {
      fileList.value = [];
    });
  }
}

// 表格数据类型定义
interface TableRow {
  question: string;
  questionTranslation: string;
  answer: string;
  vgGuide: string;
  vgGuideTranslation: string;
}

// 存储所有数据的 Map
const questionsMap = ref<Record<string, TableRow[]>>();
const maxNum = computed(() => Object.keys(questionsMap).length);
// 新增：存储 index 到 filename 的映射
const fileIndexMap = ref<string[]>([]);
const tableData = ref<TableRow[]>([]);

const handleExceed: UploadProps["onExceed"] = (files) => {
  const file = files[0];
  if (!file) return;
  fileList.value = files;
  Papa.parse(file, {
    complete: (results) => {
      const rows = results.data as string[][];
      const dataMap: Record<string, TableRow[]> = {};
      const indexArray: string[] = [];

      // 跳过表头，处理每一行
      rows.slice(1).forEach((columns) => {
        if (columns.length < 2) return; // 跳过空行

        const fileName = columns[1]; // file_name 在第二列
        indexArray.push(fileName);

        const fileQuestions: TableRow[] = [];
        // 处理5个问题
        for (let i = 0; i < 5; i++) {
          fileQuestions[i] = {
            question: columns[2 + i * 5] || "",
            questionTranslation: columns[3 + i * 5] || "",
            answer: columns[4 + i * 5] || "",
            vgGuide: columns[5 + i * 5] || "",
            vgGuideTranslation: columns[6 + i * 5] || "",
          };
        }

        dataMap[fileName] = fileQuestions;
      });

      questionsMap.value = dataMap;
      fileIndexMap.value = indexArray;
      updateTableData(); // 默认显示第num题
    },
    error: (error) => {
      console.error("CSV解析错误:", error);
    },
  });
};

// 优化后的 updateTableData 函数
const num = ref(0);
const currentFileName = computed(() => fileIndexMap.value[num.value]);
function updateTableData(): void {
  tableData.value = questionsMap.value?.[currentFileName.value!] || [];
  localStorage.setItem("current_num", String(num.value));
}

// 表格当前行
const currentRow = ref();

const handleCurrentChange = (row: TableRow) => {
  currentRow.value = row;
  formData.value.question = row.question;
  formData.value.answer = row.answer;
  formData.value.vgGuide = row.vgGuide;
};

const formData = ref({
  question: "",
  answer: "",
  vgGuide: "",
});

onMounted(() => {
  // 初始化时设置当前数目
  const current_num = Number(localStorage.getItem("current_num"));
  if (current_num && !Number.isNaN(current_num)) num.value = current_num;
});
</script>

<style>
.el-page-header__title {
  font-size: 20px;
  font-weight: bold;
}

.el-link {
  font-size: 14px;
}

.el-card {
  border-radius: 8px;
}
</style>
