import { createApp } from "vue";
import "./style.css";
import "vue-final-modal/style.css";
import App from "./App.vue";
import { createPinia } from "pinia";
import { VueQueryPlugin } from "@tanstack/vue-query";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { router } from "./router";
import { useAuthStore } from "@/store/authStore.ts";
import { createVfm } from "vue-final-modal";

const app = createApp(App);
const vfm = createVfm();

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(vfm);
app.use(pinia);
app.use(VueQueryPlugin, {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        staleTime: 5000 * 60,
        refetchOnReconnect: "always",
        refetchOnWindowFocus: true,
      },
    },
  },
  enableDevtoolsV6Plugin: true,
});
const authStore = useAuthStore();
authStore.initializeAuth();
app.use(router).mount("#app");
