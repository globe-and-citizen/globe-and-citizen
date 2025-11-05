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
import Vue3Toastify, { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import * as Sentry from "@sentry/vue";

const app = createApp(App);
const vfm = createVfm();
const backend_url = import.meta.env.VITE_API_BASE_URL;

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
app.use(Vue3Toastify, {
  icon: false,
  position: toast.POSITION.BOTTOM_RIGHT,
  progressStyle: {
    opacity: 0,
  },
  style: {
    opacity: "1",
    userSelect: "initial",
  },
});
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
app.config.globalProperties.$backend_url = backend_url;
Sentry.init({
  app,
  dsn: "https://a39a7dc57b658f138b0ab53f45a20478@o4507662781382656.ingest.us.sentry.io/4510299777073152",
  sendDefaultPii: true,
  integrations: [
    Sentry.feedbackIntegration({
      colorScheme: "system",
      showEmail: false,
    }),
  ],
});
app.use(router).mount("#app");
const authStore = useAuthStore();
authStore.initializeAuth();
