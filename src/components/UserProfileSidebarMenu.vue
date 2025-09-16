<template>
  <div class="sidebar-menu flex flex-col">
    <div v-for="(items, section) in groupedMenu" :key="section" class="mb-6">
      <h3 class="font-lato font-bold text-2xl mb-6 tracking-[-1px]">
        {{ section }}
      </h3>
      <div
        v-for="item in items"
        :key="item.url"
        class="font-lato font-normal text-base not-first-of-type:pt-2"
      >
        <!-- Use absolute path to prevent duplicated 'profile' segments when navigating between nested profile routes -->
        <RouterLink
          :to="`/profile${item.url}`"
          class="flex gap-2"
          active-class="border-l-3 pl-2 !border-l-black font-semibold"
        >
          <component :is="item.icon" class="w-6 h-6" />
          {{ item.title }}
        </RouterLink>
      </div>
    </div>
    <router-link
      v-if="isAdmin"
      :to="`/admin`"
      class="font-lato font-normal text-base"
    >
      <i :class="`icon-admin`"></i>
      Admin Panel
    </router-link>
    <div
      class="font-lato font-normal text-base mt-4 cursor-pointer flex gap-2"
      @click="logOut"
    >
      <component :is="logout" />
      Logout
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { menuItems } from "../composables/menuItems.ts";
import { useQuery } from "@tanstack/vue-query";
import { useAuthStore } from "@/store/authStore.ts";
import { getUser } from "@/api/user.ts";
import type { UserType } from "@/models/Auth";
import { RouterLink, useRouter } from "vue-router";
import logout from "@/assets/icons/logout.svg";

const authStore = useAuthStore();
const router = useRouter();

const groupedMenu = computed(() => {
  return menuItems.reduce((acc: Record<string, typeof menuItems>, item) => {
    if (!acc[item.section]) {
      acc[item.section] = [];
    }
    acc[item.section].push(item);
    return acc;
  }, {});
});

const { data: userData } = useQuery({
  queryKey: ["user", authStore.user?.username],
  queryFn: async () => {
    if (!authStore.user?.username) {
      throw new Error("User username is not available.");
    }
    const response = await getUser(authStore.user.username);
    return response as Partial<UserType>;
  },
  enabled: !!authStore.user?.username,
});

const isAdmin = computed(() => {
  return userData.value?.role?.name === "admin";
});

const logOut = () => {
  authStore.logout();
  router.push("/");
};
</script>

<style scoped>
.sidebar-menu {
  width: 100%;
  min-width: 174px;
}
</style>
