<template>
  <div>
    <div class="flex justify-center gap-2">
      <img
        v-if="user?.profile_picture_url"
        :src="user?.profile_picture_url"
        alt="User Avatar"
        class="w-20 h-20 rounded-full object-cover"
      />
      <div
        v-else
        class="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
        :style="generateUserIcon(user?.username || 'A')"
      >
        <span class="text-black text-2xl font-semibold">
          {{ user?.username.charAt(0).toUpperCase() || "A" }}
        </span>
      </div>
      <div class="flex flex-col items-baseline gap-1">
        <p class="text-xl font-bold font-lato">@{{ user?.username }}</p>
        <p class="text-base text-white-60 font-lato font-normal">
          IT developer at Microsoft
        </p>
        <p class="text-xs text-white-60 font-lato font-medium">
          Chisinau, Republic of Moldova
        </p>
      </div>
    </div>
    <div class="flex gap-8 justify-center mt-2 font-lato text-white-60">
      <p>Trust Rate <b>99%</b></p>
      <p>Opinions <b>12</b></p>
      <p>Followers <b>233</b></p>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { UserType } from "@/models/Auth";
import { generateUserIcon } from "@/composables/utils.ts";
interface Props {
  user: UserType;
}

defineProps<Props>();
</script>
