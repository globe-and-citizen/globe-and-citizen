import HomeView from "../views/HomeView.vue";
import AboutView from "../views/AboutView.vue";
import SignInView from "../views/SignInView.vue";
import SignUpView from "../views/SignUpView.vue";
import BecomeAContributorView from "../views/BecomeAContributorView.vue";
import TrendingView from "../views/TrendingView.vue";
import AdvertisementView from "../views/AdvertisementView.vue";
import PostView from "../views/PostView.vue";
import OpinionView from "../views/OpinionView.vue";
import ProfilePageView from "../views/ProfilePageView.vue";
import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../store/authStore";
import PublicLayout from "../layouts/PublicLayout.vue";
import AdminLayout from "../layouts/AdminLayout.vue";
import AdminDashboard from "@/views/AdminPanel/AdminDashboard.vue";
import UsersManagement from "@/views/AdminPanel/UsersManagement.vue";
import NewsManagement from "@/views/AdminPanel/NewsManagement.vue";
import PostedNews from "@/views/AdminPanel/PostedNews.vue";
import OpinionStatsView from "@/views/OpinionStatsView.vue";

const routes = [
  {
    path: "/",
    component: PublicLayout,
    children: [
      { path: "", component: HomeView },
      {
        path: "trending",
        component: TrendingView,
      },
      { path: "about-us", component: AboutView },
      { path: "become-a-contributor", component: BecomeAContributorView },
      { path: "sign-in", component: SignInView },
      { path: "sign-up", component: SignUpView },
      {
        path: "post/:id",
        name: "PostView",
        component: PostView,
        props: true,
      },
      {
        path: "post/:id/:opinionId",
        name: "PostEntryView",
        component: OpinionView,
        props: true,
      },
      {
        path: "post/:id/:opinionId/stats",
        name: "OpinionStatsView",
        component: OpinionStatsView,
        props: true,
      },
      { path: "advertisement/:id", component: AdvertisementView },
      { path: "profile", component: ProfilePageView },
    ],
  },
  {
    path: "/admin",
    component: AdminLayout,
    meta: { requiresAdmin: true },
    children: [
      {
        path: "",
        redirect: "/admin/home",
      },
      { path: "home", component: AdminDashboard },
      { path: "users", component: UsersManagement },
      { path: "news-processor", component: NewsManagement },
      { path: "posted-news", component: PostedNews },
      // { path: "search", component: SearchView },
      // { path: "settings", component: SettingsView },
    ],
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Restrict /sign-in and /sign-up for logged-in users
router.beforeEach((to, _, next) => {
  const authStore = useAuthStore();
  const isLoggedIn = authStore.isUserAuthenticated;
  const isAdmin = authStore.user?.role.name === "admin";

  if (isLoggedIn && (to.path === "/sign-in" || to.path === "/sign-up")) {
    next({ path: "/" });
  } else if (to.matched.some((record) => record.meta.requiresAdmin)) {
    if (!isLoggedIn) {
      next({ path: "/sign-in" });
    } else if (!isAdmin) {
      next({ path: "/" });
    } else {
      next();
    }
  } else if (!isLoggedIn && to.path === "/profile") {
    next({ path: "/sign-in" });
  } else {
    next();
  }
});

// export const router = createRouter({
//   history: createWebHistory(),
//   routes,
// });

// router.beforeEach((to, _, next) => {
//   const authStore = useAuthStore();
//   const isLoggedIn = authStore.isUserAuthenticated;
//   const isAdmin = authStore.user?.role === "admin"; // Adjust to match your data

//   if (isLoggedIn && (to.path === "/sign-in" || to.path === "/sign-up")) {
//     next({ path: "/" });
//   } else if (!isLoggedIn && to.meta.requiresAdmin) {
//     next({ path: "/sign-in" });
//   } else if (to.meta.requiresAdmin && !isAdmin) {
//     next({ path: "/" }); // redirect non-admins from admin panel
//   } else if (!isLoggedIn && to.path === "/profile") {
//     next({ path: "/sign-in" });
//   } else {
//     next();
//   }
// });
