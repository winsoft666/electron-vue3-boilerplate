import { createApp } from "vue";
import "./style.css";

// 导入 FontAwesome 图标
import { library as fontAwesomeLibrary } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { fas } from "@fortawesome/free-solid-svg-icons"; // solid样式图标
fontAwesomeLibrary.add(fas);

import App from "./App.vue";
import router from "./router";

const app = createApp(App);

app.use(router);
app.component("FontAwesomeIcon", FontAwesomeIcon);
app.mount("#app");
