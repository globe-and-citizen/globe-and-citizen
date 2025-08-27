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
        <router-link :to="`/profile${item.url}`">
          <i :class="`icon-${item.icon}`"></i>
          {{ item.title }}
        </router-link>
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
      class="font-lato font-normal text-base mt-4 cursor-pointer"
      @click="logOut"
    >
      Logout
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import menuItems from "./menuItems.json";
import { useQuery } from "@tanstack/vue-query";
import { useAuthStore } from "@/store/authStore";
import { getUser } from "@/api/user";
import type { UserType } from "@/models/Auth";
import { useRouter } from "vue-router";

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
  queryKey: ["user", authStore.user?.id],
  queryFn: async () => {
    if (!authStore.user?.id) {
      throw new Error("User ID is not available.");
    }
    const response = await getUser(authStore.user.id);
    return response as Partial<UserType>;
  },
  enabled: !!authStore.user?.id,
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
  padding-right: 1rem;
  border-right: 1px solid rgba(14, 12, 12, 0.2);
  @media screen and (max-width: 768px) {
    border-right: 0;
  }
}
</style>
