<template>
  <div class="error-page">
    <div class="error-tip">
      错误代码：{{ code }}
      <p>非常抱歉，页面走丢了</p>
      <el-button size="large" @click="$router.push('/')">返回首页</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

const code = computed(() => useRoute().params.code as string);
</script>
<style>
.error-page {
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
}
.error-tip {
  font-size: 30px;
  p {
    font-size: 16px;
    color: #666;
  }
}
</style>
