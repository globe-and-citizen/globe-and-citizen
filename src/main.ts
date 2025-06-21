import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { createPinia } from "pinia";
import { VueQueryPlugin } from "@tanstack/vue-query";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { router } from "./router";
import { useAuthStore } from "@/store/authStore.ts";

const app = createApp(App);

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(pinia);
app.use(VueQueryPlugin);

const authStore = useAuthStore();
authStore.initializeAuth();
app.use(VueQueryPlugin, {
  enableDevtoolsV6Plugin: true,
});
app.use(router).mount("#app");
