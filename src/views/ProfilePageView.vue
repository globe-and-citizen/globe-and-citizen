<template>
  <div class="flex items-center gap-2">
    <img
      v-if="user?.profilePicture"
      :src="user.profilePicture"
      alt="User Avatar"
      class="w-8 h-8 rounded-full"
    />
    <span class="text-base font-lato text-black-100">{{ user?.name }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "../store/authStore";

const authStore = useAuthStore();
const user = ref({
  name: authStore?.user?.username || "Guest User",
  profilePicture:
    "https://static-00.iconduck.com/assets.00/user-circle-icon-2048x2048-rbk3fbd1.png",
});
</script>
