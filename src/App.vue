<template>
  <router-view />
  <VueQueryDevtools />
</template>

<script setup lang="ts">
import { VueQueryDevtools } from "@tanstack/vue-query-devtools";
import { computed, watchEffect } from "vue";
import { useQuery } from "@tanstack/vue-query";
import { traceUser } from "@/api/user.ts";
import { useAuthStore } from "@/store/authStore.ts";

const { data } = useQuery<{ country_long: string; ip_addr: string }>({
  queryKey: ["userTrace"],
  queryFn: traceUser,
  refetchOnWindowFocus: false,
  refetchOnMount: false,
});

const userLocation = computed(() => {
  return data.value ? data.value.country_long : "Unknown";
});

const authStore = useAuthStore();

watchEffect(() => {
  authStore.setUserLocation(userLocation.value);
});
</script>

<style scoped></style>
