<template>
  <div class="bg-white border border-gray-200 rounded-lg p-6 mt-5 font-lato">
    <div class="mb-4">
      <h3 class="text-lg font-semibold text-gray-800 mb-2">
        Profile Completeness
      </h3>
      <div class="flex items-center gap-3 mb-2">
        <span class="text-2xl font-bold text-blue-600"
          >{{ profileCompleteness.completed }}/{{
            profileCompleteness.total
          }}</span
        >
      </div>
      <!-- Progress Bar -->
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div
          class="bg-blue-500 h-2 rounded-full transition-all duration-300"
          :style="{ width: `${profileCompleteness.percentage}%` }"
        ></div>
      </div>
    </div>

    <!-- Details Section -->
    <div class="mb-4">
      <h4 class="text-sm font-medium text-gray-700 mb-3">Details:</h4>
      <div class="space-y-2">
        <div
          v-for="detail in profileDetails"
          :key="detail.label"
          class="flex items-center gap-2"
        >
          <div
            class="w-4 h-4 rounded-full flex items-center justify-center"
            :class="detail.completed ? 'bg-green-100' : 'bg-gray-100'"
          >
            <svg
              v-if="detail.completed"
              class="w-3 h-3 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
            <div v-else class="w-2 h-2 bg-gray-400 rounded-full"></div>
          </div>
          <span
            class="text-sm"
            :class="detail.completed ? 'text-green-600' : 'text-gray-600'"
          >
            {{ detail.label }}
          </span>
        </div>
      </div>
    </div>

    <!-- Last updated -->
    <!--    <div class="mb-4">-->
    <!--      <p class="text-sm text-gray-500">-->
    <!--        Last updated on:-->
    <!--        <span>{{-->
    <!--          metadataUpdated-->
    <!--            ? new Date(userData?.metadata_updated_at).toLocaleDateString(-->
    <!--                undefined,-->
    <!--                {-->
    <!--                  year: "numeric",-->
    <!--                  month: "short",-->
    <!--                  day: "numeric",-->
    <!--                  hour: "2-digit",-->
    <!--                  minute: "2-digit",-->
    <!--                }-->
    <!--              )-->
    <!--            : "Not updated yet"-->
    <!--        }}</span>-->
    <!--      </p>-->
    <!--    </div>-->

    <div class="mb-4 flex justify-between items-center">
      <button
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition cursor-pointer"
        target="_blank"
        rel="noopener noreferrer"
        @click="openExternalLink(loginUrlData || '#')"
      >
        Authorize Now
      </button>
    </div>
    <!-- Benefits Section -->
    <div class="bg-blue-50 rounded-md p-3">
      <h4 class="text-sm font-medium text-blue-800 mb-2">Benefits:</h4>
      <p class="text-sm text-blue-700">{{ profileBenefit }}</p>
    </div>
  </div>
</template>
<script setup lang="ts">
import { getLayer8LoginUrl, layer8Callback } from "@/api/layer8";
import { getUser } from "@/api/user";
import type { UserType } from "@/models/Auth";
import { useAuthStore } from "@/store/authStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { computed } from "vue";
const queryClient = useQueryClient();

const { data: loginUrl } = useQuery({
  queryKey: ["layer8LoginUrl"],
  queryFn: async () => {
    const response = await getLayer8LoginUrl();

    return response as { data: { auth_url: string } };
  },
});
const authStore = useAuthStore();

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

const { mutate } = useMutation({
  mutationFn: async (code: string) => {
    await layer8Callback(code);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["user"] });
  },
  onError: (error) => {
    console.error("Failed:", error);
  },
});

// const metadataUpdated = computed(() => {
//   return (
//     userData.value?.bio ||
//     userData.value?.color ||
//     userData.value?.display_name ||
//     userData.value?.email_verified
//   );
// });

const profileDetails = computed(() => [
  {
    label: "Email Verified",
    completed: userData.value?.email_verified || false,
  },
  {
    label: "Display Name Set",
    completed: !!userData.value?.display_name,
  },
  {
    label: "Bio Completed",
    completed: !!userData.value?.bio,
  },
  {
    label: "Favorite Color Selected",
    completed: !!userData.value?.color,
  },
]);

const loginUrlData = computed(() => loginUrl?.value?.data?.auth_url);

const openExternalLink = (url: string) => {
  const windowFeatures =
    "width=800,height=800,resizable=yes,scrollbars=yes,status=yes";

  const popupWindow = window.open(url, "_blank", windowFeatures);

  const listener = (event: MessageEvent) => {
    if (event.origin !== "http://auth.layer8proxy.net") return;
    if (event.data?.redr) {
      window.removeEventListener("message", listener);
      mutate(event.data.code);
      if (popupWindow && !popupWindow.closed) {
        popupWindow.close();
      }
    }
  };
  window.addEventListener("message", listener);
};

const profileCompleteness = computed(() => {
  const completed = profileDetails.value.filter(
    (detail) => detail.completed
  ).length;
  const total = profileDetails.value.length;
  const percentage = Math.round((completed / total) * 100);

  return {
    completed,
    total,
    percentage,
  };
});

const profileBenefit = computed(() => {
  if (profileCompleteness.value.percentage === 100) {
    return "You have unlocked all features including advanced analytics and priority support.";
  } else if (profileCompleteness.value.percentage >= 75) {
    return "You are close to unlocking all features. Complete your profile to get advanced analytics.";
  } else if (profileCompleteness.value.percentage >= 50) {
    return "Complete more sections of your profile to unlock additional features.";
  } else {
    return "A complete profile helps you get the most out of our platform. Start by verifying your email.";
  }
});
</script>
