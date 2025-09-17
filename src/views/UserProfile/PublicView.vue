<template>
  <RouterLink
    v-if="!isProfileByIdView"
    to="profile-menu"
    class="block md:hidden cursor-pointer"
  >
    <component :is="arrowBackIcon" class="rotate-180" />
  </RouterLink>
  <UserInfo />
  <ProfileCompleteness />
</template>

<script setup lang="ts">
import UserInfo from "../../components/UserInfo.vue";
import arrowBackIcon from "../../assets/arrow-back.svg";
import ProfileCompleteness from "../../components/ProfileCompleteness.vue";
import { useRoute } from "vue-router";
import { computed } from "vue";

const route = useRoute();
const isProfileByIdView = computed(() => route.params.id !== undefined);
</script>
