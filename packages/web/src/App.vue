<template>
  <!-- @vue-expect-error -->
  <el-page-header title="VQA标注系统" :icon="null" style="padding: 16px">
    <template #extra>
      <div class="flex items-center">
        <span>&emsp;</span>
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
        <el-button type="primary" @click="handleSave">保存</el-button>
        <el-button v-if="!isLoggedIn" type="primary" @click="showLogin">
          登录
        </el-button>
        <el-button v-else @click="handleLogout">退出登录</el-button>
      </div>
    </template>
  </el-page-header>
  <div class="flex main-container">
    <el-card class="table-container">
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
        <el-table-column property="user" label="操作人" width="100" />
        <el-table-column property="updatedAt" label="更新时间" width="160" />
      </el-table>
    </el-card>
    <el-card class="form-container">
      <el-form ref="formRef" :model="formData" label-width="30px">
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
  </div>
  <el-card style="margin-top: 16px">
    <div id="image"></div>
  </el-card>
  <el-dialog
    v-model="loginVisible"
    :title="isLoggedIn ? '用户设置' : '用户登录'"
    width="520px"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <Login @login-success="handleLoginSuccess" />
  </el-dialog>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
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
  ElMessage,
  ElDialog,
} from "element-plus";
import type { UploadProps } from "element-plus";
import { IMG_FOLDER_PATH, BOX_PATH } from "./config";
import { type TableRow } from "./utils";
import Login from "./components/Login.vue";

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

const maxNum = ref(0);
const tableData = ref<TableRow[]>([]);

const handleExceed: UploadProps["onExceed"] = async (files: File[]) => {
  const file = files[0];
  if (!file) return;
  await uploadCSVToServer(file);
};

// 当前题目序号
const num = ref(2866);
// 当前图片文件名
const currentFileName = ref<string>("");

// 获取统计信息
const loadStats = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const response = await fetch("http://localhost:3000/api/form/stats", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const { totalQuestions, completedQuestions } = await response.json();
      maxNum.value = totalQuestions;
      // 可以显示完成进度
      console.log(`已完成: ${completedQuestions}/${totalQuestions}`);
    }
  } catch (error) {
    console.error("获取统计信息失败:", error);
  }
};

// 加载表单数据
const loadFormData = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const response = await fetch(
      `http://localhost:3000/api/form/query?fileName=${currentFileName.value}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      const { data } = await response.json();
      tableData.value = data.map((item: any) => ({
        questionId: item.questionId,
        question: item.question,
        answer: item.answer,
        vgGuide: item.vgGuide,
        user: item.user.username,
        updatedAt: new Date(item.updatedAt).toLocaleString(),
      }));
    }
  } catch (error) {
    console.error("加载数据失败:", error);
  }
};

// 获取最后编辑的文件
const loadLastEdited = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const response = await fetch("http://localhost:3000/api/form/last-edited", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const { lastEditedFile } = await response.json();
      if (lastEditedFile) {
        currentFileName.value = lastEditedFile;
        await loadFormData();
      }
    }
  } catch (error) {
    console.error("获取最后编辑记录失败:", error);
  }
};

// 修改题号变化处理
const onNumChange = async () => {
  const response = await fetch(
    `http://localhost:3000/api/form/query?questionId=${num.value}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  if (response.ok) {
    const { data } = await response.json();
    if (data.length > 0) {
      currentFileName.value = data[0].imageFileName;
      await loadFormData();
      displayImage(currentFileName.value);
    }
  }
};

// 组件挂载时初始化
onMounted(async () => {
  if (localStorage.getItem("token")) {
    await loadStats();
    await loadLastEdited();
  }
});

// 监听登录状态变化
watch(
  () => isLoggedIn.value,
  async (newValue) => {
    if (newValue) {
      await loadStats();
      await loadLastEdited();
    } else {
      // 清空数据
      tableData.value = [];
      currentFileName.value = "";
    }
  }
);

// 表格当前行
const currentRow = ref();

const selectQuestion = (row: TableRow) => {
  currentRow.value = row;
  formData.value.question = row.question;
  formData.value.answer = row.answer;
  formData.value.vgGuide = row.vgGuide;
};

interface BBox {
  type: string;
  bbox2d: number[];
}

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
const imageElement = ref<HTMLImageElement>();
function displayImage(name: string) {
  let boxDom = document.getElementById("image");
  if (!boxDom) return;
  boxDom.innerHTML = "";

  // 清空图像路径
  imageElement.value = document.createElement("img");
  imageElement.value.style.objectFit = "scale-down";
  imageElement.value.style.width = "100%";

  const imagePath = IMG_FOLDER_PATH + name;
  console.log("load", imagePath); // 在控制台打印图像路径
  imageElement.value.src = imagePath;
  boxDom.appendChild(imageElement.value);

  // 在图像加载后绘制边界框
  imageElement.value.onload = () => {
    loadBboxes(name);
  };
}

// 读取边界框数据
const bboxes = ref<BBox[]>([]);
function loadBboxes(name: string) {
  const bbox_Path = `${
    BOX_PATH + name.replace(/\.(jpg|jpeg|png|gif|bmp|tiff|webp)$/i, "")
  }.txt`;

  // 自动加载之前的标注数据
  // if (annotations[name]) {
  //   formData.value.selectedBboxes = annotations[name]; // 加载之前的标注
  // }

  fetch(bbox_Path)
    .then((response) => response.text())
    .then((data) => {
      const lines = data.split("\n");
      lines.forEach((line) => {
        bboxes.value = [];
        const parts = line.trim().split(" ");
        if (parts.length >= 14) {
          const bboxData = {
            type: parts[0],
            bbox2d: parts.slice(4, 8).map(Number),
          };
          bboxes.value.push(bboxData);
        }
      });
      drawBboxes();
    })
    .catch((error) => console.error("Error loading bounding boxes:", error));
}

// 绘制边界框
let scale = 1; // 初始缩放比例
function drawBboxes() {
  const bboxesContainer = document.querySelector("#image");
  if (!bboxesContainer || !imageElement.value) {
    console.error("can not find bboxesContainer or imageElement");
    return;
  }
  // 获取缩放后的实际位置和大小
  const imgRect = imageElement.value.getBoundingClientRect();
  scale = imgRect.width / imageElement.value.naturalWidth;

  bboxes.value.forEach((bbox) => {
    const [x1, y1, x2, y2] = bbox.bbox2d;

    // 计算边界框的宽度和高度
    const bboxWidth = (x2 - x1) * scale;
    const bboxHeight = (y2 - y1) * scale;

    // 计算边界框的左上角位置
    const left = x1 * scale;
    const top = y1 * scale;

    // 创建并设置边界框元素
    const bboxElement = document.createElement("div");
    bboxElement.className = "bbox";
    bboxElement.style.left = `${left}px`;
    bboxElement.style.top = `${top}px`;
    bboxElement.style.width = `${bboxWidth}px`;
    bboxElement.style.height = `${bboxHeight}px`;

    // 如果边界框在选中列表中，添加选中样式
    // if (selectedBboxes.includes(bbox)) {
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
      handleBboxClick(bbox); // 调用外部处理程序
    });

    // 添加到容器中
    bboxesContainer.appendChild(bboxElement);
    bboxesContainer.appendChild(labelElement);
  });
}

// 定义点击事件处理程序
function handleBboxClick(bbox: BBox) {
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

  drawBboxes(); // 重新绘制边界框
}

// 添加登录相关的状态管理
const loginVisible = ref(false);
const isLoggedIn = ref(false);

// 显示登录对话框
const showLogin = () => {
  loginVisible.value = true;
};

// 处理登录成功
const handleLoginSuccess = () => {
  isLoggedIn.value = true;
  loginVisible.value = false;
  ElMessage.success("登录成功");
};

// 处理退出登录
const handleLogout = () => {
  ElMessageBox.confirm("确定要退出登录吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      isLoggedIn.value = false;
      ElMessage.success("已退出登录");
    })
    .catch(() => {});
};

// 保存表单数据
const handleSave = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      ElMessage.warning("请先登录");
      showLogin();
      return;
    }

    const response = await fetch("http://localhost:3000/api/form/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...formData.value,
        imageFileName: currentFileName.value,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      ElMessage.success("保存成功");
      // 刷新表单数据
      await loadFormData();
    } else {
      ElMessage.error(data.message || "保存失败");
    }
  } catch (error) {
    ElMessage.error("服务器错误");
  }
};

// 上传CSV文件到服务器
const uploadCSVToServer = async (file: File, forceUpdate = false) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      ElMessage.warning("请先登录");
      return;
    }

    // 读取文件内容
    const fileContent = await file.text();

    const response = await fetch("http://localhost:3000/api/csv/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        fileContent,
        forceUpdate,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      if (data.requireConfirmation) {
        // 需要确认是否覆盖
        ElMessageBox.confirm("题目数据将被覆盖，是否继续？", "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
          .then(() => {
            // 用户确认覆盖，重新上传
            uploadCSVToServer(file, true);
          })
          .catch(() => {
            ElMessage.info("已取消上传");
            fileList.value = []; // 清空文件选择
          });
      } else if (data.status === "success") {
        ElMessage.success("CSV文件上传成功");
      }
    } else {
      ElMessage.error(data.message || "CSV文件上传失败");
    }
  } catch (error) {
    console.error("上传CSV数据失败:", error);
    ElMessage.error("上传失败");
  }
};

onBeforeUnmount(() => {
  window.removeEventListener("resize", drawBboxes);
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

#image {
  width: 100%;
  position: relative;
}

.bbox {
  position: absolute;
  border: 2px solid red;
  /* pointer-events: none; */ /* 移除这个属性 */
}
.bbox-label {
  position: absolute;
  color: white; /* 文本颜色 */
  background-color: rgba(0, 0, 0, 0.7); /* 背景颜色 */
  padding: 2px 4px; /* 内边距 */
  border-radius: 3px; /* 圆角 */
  font-size: 12px; /* 字体大小 */
  transform: translateY(-100%); /* 上移文本 */
}
.bbox.selected {
  border-color: rgb(0, 30, 255); /* 选中时的边框颜色 */
  /*pointer-events: auto;  允许点击事件 */
}

.table-container {
}

.form-container {
  margin-left: 16px;
  width: 400px;
}

@media screen and (max-width: 768px) {
  .main-container {
    flex-direction: column;
  }
  .form-container {
    margin-left: 0;
    width: 100%;
  }
}
</style>
