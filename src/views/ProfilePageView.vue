<template>
  <div class="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg mt-4">
    <div class="flex items-center gap-4">
      <img
        :src="user.profilePicture || userPlaceholder"
        alt="User Avatar"
        class="w-16 h-16 rounded-full border border-gray-300"
      />
      <div>
        <h1 class="text-xl font-semibold text-gray-800">{{ user.name }}</h1>
        <p class="text-sm text-gray-500">{{ user.email }}</p>
        <p class="text-sm text-gray-500">
          Location: {{ user.location || "Unknown" }}
        </p>
        <p class="text-sm text-gray-500">
          Date of Birth: {{ user.dateOfBirth || "Not provided" }}
        </p>
        <a
          v-if="user.website"
          :href="user.website"
          target="_blank"
          class="text-sm text-blue-500 hover:underline"
        >
          {{ user.website }}
        </a>
      </div>
    </div>

    <div class="mt-6">
      <h2 class="text-lg font-medium text-gray-800">About</h2>
      <p class="mt-2 text-gray-600">{{ user.bio || "No bio available." }}</p>
    </div>

    <div class="mt-6 flex items-end flex-col">
      <Button
        variant="primary"
        title="Edit Profile"
        class="max-w-xs mt-2"
        @click="editProfile"
      />
      <Button
        v-if="user.role.name === 'admin'"
        class="max-w-xs mt-2"
        title="Go to Admin Panel"
        variant="secondary"
        @click="navigateToAdminPanel"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "../store/authStore";
import userPlaceholder from "@/assets/user-placeholder.png";
import { useRouter } from "vue-router";
import Button from "@/components/Button/Button.vue";

const authStore = useAuthStore();
const router = useRouter();
const user = ref({
  name: authStore?.user?.username || "Guest User",
  email: authStore?.user?.email || "guest@example.com",
  profilePicture: authStore?.user?.profile_picture_url || "",
  bio: authStore?.user?.bio || "",
  role: authStore?.user?.role || { name: "user" },
  location: authStore?.user?.location || "",
  website: authStore?.user?.website || "",
  dateOfBirth: authStore?.user?.date_of_birth || "",
});

function editProfile() {
  console.log("Edit profile clicked");
  // Logic for editing profile can be added here
}

function navigateToAdminPanel() {
  router.push("/admin");
}
</script>

<style scoped></style>
