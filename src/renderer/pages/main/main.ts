import { createApp } from "vue";
import "./style.css";

/* import the fontawesome core */
import { library } from "@fortawesome/fontawesome-svg-core";

/* import font awesome icon component */
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

/* import all solid icons */
import { fas } from "@fortawesome/free-solid-svg-icons";
import App from "./App.vue";

/* add icons to the library */
library.add(fas);

const app = createApp(App);

app
  .component("FontAwesomeIcon", FontAwesomeIcon)
  .mount("#app");
