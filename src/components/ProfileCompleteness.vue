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

    <!-- Benefits Section -->
    <div class="bg-blue-50 rounded-md p-3">
      <h4 class="text-sm font-medium text-blue-800 mb-2">Benefits:</h4>
      <p class="text-sm text-blue-700">{{ profileBenefit }}</p>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from "vue";

// Dummy data for profile completeness
const profileDetails = ref([
  { label: "Email Verified", completed: false },
  { label: "Country Provided", completed: true },
  { label: "Display Name Provided", completed: true },
  { label: "Color Provided", completed: true },
]);

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

const profileBenefit = ref("Your profile is considered trustworthy");
</script>
