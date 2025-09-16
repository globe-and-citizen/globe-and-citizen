<template>
  <div class="flex flex-col md:flex-row gap-4 items-center md:items-start">
    <div class="min-w-[134px] flex justify-center">
      <img
        v-if="user?.profile_picture_url"
        :src="user?.profile_picture_url"
        alt="User Avatar"
        class="w-[120px] h-[120px] rounded-full object-cover"
      />
      <div
        v-else
        class="w-[120px] h-[120px] rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
        :style="generateUserIcon(user?.username || 'A')"
      >
        <span class="text-black text-2xl font-semibold">
          {{ user?.username?.charAt(0).toUpperCase() || "A" }}
        </span>
      </div>
    </div>
    <div class="font-lato w-full px-6 md:px-0 text-center md:text-left">
      <div class="flex justify-center md:justify-between">
        <p class="font-bold text-2xl">@{{ user?.username }}</p>

        <RouterLink
          v-if="!isProfileByIdView"
          to="profile-settings"
          class="cursor-pointer underline underline-offset-4 decoration-black-100 hidden md:block"
          >Edit</RouterLink
        >
      </div>
      <p class="text-base font-normal">{{ user?.description }}</p>
      <div class="mt-2">
        <p class="font-normal text-black-40">Bio</p>
        <p class="italic text-black-100">"{{ user?.bio }}"</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { getUser } from "@/api/user.ts";
import type { UserType } from "@/models/Auth";
import { useAuthStore } from "@/store/authStore.ts";
import { useQuery } from "@tanstack/vue-query";
import { generateUserIcon } from "@/composables/utils.ts";
import { useRoute } from "vue-router";
import { computed } from "vue";

const route = useRoute();
const isProfileByIdView = computed(() => route.params.id !== undefined);
const authStore = useAuthStore();
const username = isProfileByIdView.value
  ? route.params.id
  : authStore.user?.username;

const { data: user } = useQuery({
  queryKey: ["user", username],
  queryFn: async () => {
    if (!authStore.user?.username) {
      throw new Error("User username is not available.");
    }
    const response = await getUser(username as string);
    return response as Partial<UserType>;
  },
  enabled: isProfileByIdView.value
    ? !!route.params.id
    : !!authStore.user?.username,
});
</script>
