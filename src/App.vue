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
          style="width: 200px"
          @change="onNumChange"
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
              @click="selectQuestion(scope.row)"
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
  <el-card style="margin-top: 16px">
    <div id="image"></div>
  </el-card>
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
import { IMG_FOLDER_PATH, BOX_PATH } from "./config";
import { parseCSVRow, type TableRow } from "./utils";

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

// 存储所有数据的 Map
const questionsMap = ref<Record<string, TableRow[]>>();
// 存储 index 到 filename 的映射
const fileIndexMap = ref<string[]>([]);
const maxNum = computed(() => fileIndexMap.value.length);
const tableData = ref<TableRow[]>([]);

const handleExceed: UploadProps["onExceed"] = (files: File[]) => {
  const file = files[0];
  if (!file) return;
  fileList.value = files;
  parseCSVRow(file, (dataMap, indexArray) => {
    questionsMap.value = dataMap;
    fileIndexMap.value = indexArray;
    onNumChange();
  });
};

// 当前题目序号
const num = ref(2866);
// 当前图片文件名
const currentFileName = computed(() => fileIndexMap.value[num.value]);
function onNumChange(): void {
  tableData.value = questionsMap.value?.[currentFileName.value!] || [];
  displayImage(currentFileName.value);
  localStorage.setItem("current_num", String(num.value));
}

// 表格当前行
const currentRow = ref();

const selectQuestion = (row: TableRow) => {
  currentRow.value = row;
  formData.value.question = row.question;
  formData.value.answer = row.answer;
  formData.value.vgGuide = row.vgGuide;
};

const formData = ref<{
  question: string;
  answer: string;
  vgGuide: string;
  selectedBboxes: BBox[];
}>({
  question: "",
  answer: "",
  vgGuide: "",
  selectedBboxes: [],
});

/**
 * 绘制图片
 * @param name 图片名称
 */
function displayImage(name: string) {
  var boxDom = document.getElementById("image");
  if (!boxDom) return;
  boxDom.innerHTML = "";

  // 清空图像路径
  const imageElement = document.createElement("img");
  imageElement.style.objectFit = "scale-down";
  imageElement.style.width = "100%";

  const imagePath = IMG_FOLDER_PATH + name;
  console.log("load", imagePath); // 在控制台打印图像路径
  imageElement.src = imagePath;
  boxDom.appendChild(imageElement);

  // 在图像加载后绘制边界框
  imageElement.onload = () => {
    loadBboxes(name, imageElement);
  };
}

// 读取边界框数据
interface BBox {
  type: string;
  bbox2d: number[];
}
let bboxes: BBox[] = [];
function loadBboxes(name: string, imageElement: HTMLImageElement) {
  const bbox_Path = `${
    BOX_PATH + name.replace(/\.(jpg|jpeg|png|gif|bmp|tiff|webp)$/i, "")
  }.txt`;
  debugger;

  // 自动加载之前的标注数据
  // if (annotations[name]) {
  //   formData.value.selectedBboxes = annotations[name]; // 加载之前的标注
  // }

  fetch(bbox_Path)
    .then((response) => response.text())
    .then((data) => {
      bboxes = [];
      const lines = data.split("\n");
      lines.forEach((line) => {
        const parts = line.trim().split(" ");
        if (parts.length >= 14) {
          const bboxData = {
            type: parts[0],
            bbox2d: parts.slice(4, 8).map(Number),
          };
          bboxes.push(bboxData);
        }
      });
      drawBboxes(imageElement);
    })
    .catch((error) => console.error("Error loading bounding boxes:", error));
}

// 绘制边界框
let scale = 1; // 初始缩放比例
function drawBboxes(imageElement: HTMLImageElement) {
  const bboxesContainer = document.createElement("div");

  const imgRect = imageElement.getBoundingClientRect(); // 获取缩放后的实际位置和大小
  const imgLeft = imgRect.left; // 获取缩放后的左边位置
  const imgTop = imgRect.top; // 获取缩放后的上边位置

  bboxes.forEach((bbox) => {
    const [x1, y1, x2, y2] = bbox.bbox2d;

    // 计算边界框的宽度和高度
    const bboxWidth = (x2 - x1) * scale;
    const bboxHeight = (y2 - y1) * scale;

    // 计算边界框的左上角位置
    const left = imgLeft + x1 * scale;
    const top = imgTop + y1 * scale;

    // 创建并设置边界框元素
    const bboxElement = document.createElement("div");
    bboxElement.className = "bbox";
    bboxElement.style.left = `${left}px`;
    bboxElement.style.top = `${top}px`;
    bboxElement.style.width = `${bboxWidth}px`;
    bboxElement.style.height = `${bboxHeight}px`;

    // 如果边界框在选中列表中，添加选中样式
    //if (selectedBboxes.includes(bbox)) {
    if (
      formData.value.selectedBboxes.some(
        (b) => JSON.stringify(b) === JSON.stringify(bbox)
      )
    ) {
      bboxElement.classList.add("selected");
    }

    // 创建文本元素并设置内容
    const labelElement = document.createElement("div");
    labelElement.className = "bbox-label";
    labelElement.innerText = bbox.type; // 假设 type 是要显示的名称
    labelElement.style.position = "absolute";
    labelElement.style.left = `${left}px`; // 文本位置与边界框对齐
    labelElement.style.top = `${top}px`; // 文本位置与边界框对齐
    labelElement.style.transform = `translateY(-100%)`; // 使文本在边界框上方显示

    // 添加点击事件监听器
    bboxElement.addEventListener("click", (event) => {
      event.stopPropagation(); // 阻止事件冒泡到图片
      handleBboxClick(bbox, imageElement); // 调用外部处理程序
    });

    // 添加到容器中
    bboxesContainer.appendChild(bboxElement);
    bboxesContainer.appendChild(labelElement);
  });
}

// 定义点击事件处理程序
function handleBboxClick(bbox: BBox, imageElement: HTMLImageElement) {
  // 使用深度比较来检查边界框是否已被选中
  const isSelected = formData.value.selectedBboxes.some(
    (selectedBbox) =>
      selectedBbox.type === bbox.type &&
      JSON.stringify(selectedBbox.bbox2d) === JSON.stringify(bbox.bbox2d)
  );

  if (isSelected) {
    // 使用深度比较来移除选中的边界框
    formData.value.selectedBboxes = formData.value.selectedBboxes.filter(
      (selectedBbox) =>
        !(
          selectedBbox.type === bbox.type &&
          JSON.stringify(selectedBbox.bbox2d) === JSON.stringify(bbox.bbox2d)
        )
    );
  } else {
    formData.value.selectedBboxes.push(bbox); // 添加到选择列表
  }

  drawBboxes(imageElement); // 重新绘制边界框
}

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
