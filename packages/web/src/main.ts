import { createApp } from "vue";
import { createPinia } from "pinia";
import "element-plus/dist/index.css";
import "./style.scss";

import router from "./router";
import App from "./App.vue";

const pinia = createPinia();
createApp(App).use(router).use(pinia).mount("#app");
