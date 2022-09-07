import { createApp } from "vue";
import App from "./App.vue";
import { MotionPlugin } from "@vueuse/motion";

import "./styles/tailwind.css";

createApp(App).use(MotionPlugin).mount("#app");
