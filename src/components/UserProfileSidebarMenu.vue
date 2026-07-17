<template>
  <TooltipProvider :delay-duration="300">
    <div
      :class="[
        'sidebar-menu relative flex flex-col',
        { 'sidebar-menu--collapsed': isCompact },
      ]"
    >
      <button
        type="button"
        class="sidebar-toggle absolute top-0 right-[-28px] hidden size-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition-colors hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black md:flex"
        :aria-label="isCompact ? 'Expand profile menu' : 'Minimize profile menu'"
        :aria-expanded="!isCompact"
        @click="isCollapsed = !isCollapsed"
      >
        <ChevronRight
          aria-hidden="true"
          :class="[
            'size-5 transition-transform duration-200',
            { 'rotate-180': !isCompact },
          ]"
        />
      </button>

      <div
        v-for="(items, section) in groupedMenu"
        :key="section"
        :class="isCompact ? 'mb-3' : 'mb-6'"
      >
        <h3
          v-if="!isCompact"
          class="mb-6 pr-10 font-lato text-2xl font-bold tracking-[-1px]"
        >
          {{ section }}
        </h3>
        <div
          v-for="item in items"
          :key="item.url"
          class="font-lato text-base font-normal not-first-of-type:pt-2"
        >
          <Tooltip :disabled="!isCompact && !item.summary">
            <TooltipTrigger as-child>
              <!-- Use absolute path to prevent duplicated 'profile' segments when navigating between nested profile routes -->
              <RouterLink
                :to="`/profile${item.url}`"
                :class="[
                  'flex items-center gap-2',
                  { 'sidebar-link--collapsed justify-center rounded-md': isCompact },
                ]"
                :active-class="
                  isCompact
                    ? 'bg-gray-100 font-semibold'
                    : 'border-l-3 pl-2 !border-l-black font-semibold'
                "
              >
                <component :is="item.icon" aria-hidden="true" class="size-6 shrink-0" />
                <span v-if="!isCompact">{{ item.title }}</span>
                <span v-else class="sr-only">{{ item.title }}</span>
              </RouterLink>
            </TooltipTrigger>
            <TooltipContent
              v-if="isCompact || item.summary"
              side="right"
              align="center"
              :side-offset="8"
              class="max-w-64 text-sm"
            >
              {{ isCompact ? item.title : item.summary }}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      <Tooltip v-if="isAdmin" :disabled="!isCompact">
        <TooltipTrigger as-child>
          <RouterLink
            to="/admin"
            :class="[
              'flex items-center gap-2 font-lato text-base font-normal',
              { 'sidebar-link--collapsed justify-center rounded-md': isCompact },
            ]"
          >
            <i aria-hidden="true" class="icon-admin"></i>
            <span v-if="!isCompact">Admin Panel</span>
            <span v-else class="sr-only">Admin Panel</span>
          </RouterLink>
        </TooltipTrigger>
        <TooltipContent v-if="isCompact" side="right" :side-offset="8">
          Admin Panel
        </TooltipContent>
      </Tooltip>
      <Tooltip :disabled="!isCompact">
        <TooltipTrigger as-child>
          <button
            type="button"
            :class="[
              'mt-4 flex cursor-pointer items-center gap-2 font-lato text-base font-normal',
              { 'sidebar-link--collapsed justify-center rounded-md': isCompact },
            ]"
            @click="logOut"
          >
            <component :is="logout" aria-hidden="true" class="size-6 shrink-0" />
            <span v-if="!isCompact">Logout</span>
            <span v-else class="sr-only">Logout</span>
          </button>
        </TooltipTrigger>
        <TooltipContent v-if="isCompact" side="right" :side-offset="8">
          Logout
        </TooltipContent>
      </Tooltip>
    </div>
  </TooltipProvider>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useMediaQuery } from "@vueuse/core";
import { profileMenuItems } from "../composables/menuItems.ts";
import { useQuery } from "@tanstack/vue-query";
import { useAuthStore } from "@/store/authStore.ts";
import { getUser } from "@/api/user.ts";
import type { UserType } from "@/models/Auth";
import { RouterLink, useRouter } from "vue-router";
import logout from "@/assets/icons/logout.svg";
import ChevronRight from "@/assets/icons/chevron-right.svg";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const authStore = useAuthStore();
const router = useRouter();
const isDesktop = useMediaQuery("(min-width: 768px)");
const isCollapsed = ref(false);
const isCompact = computed(() => isDesktop.value && isCollapsed.value);

const groupedMenu = computed(() => {
  return profileMenuItems.reduce(
    (acc: Record<string, typeof profileMenuItems>, item) => {
      if (!acc[item.section]) {
        acc[item.section] = [];
      }
      acc[item.section].push(item);
      return acc;
    },
    {},
  );
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
  width: 190px;
  min-width: 190px;
  transition:
    width 200ms ease,
    min-width 200ms ease;
}

.sidebar-link--collapsed {
  width: 40px;
  min-height: 36px;
  align-items: center;
}

@media (min-width: 768px) {
  .sidebar-menu--collapsed {
    width: 48px;
    min-width: 48px;
    padding-top: 40px;
    align-items: center;

  }
}
</style>
