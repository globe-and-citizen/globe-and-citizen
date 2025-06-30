<template>
  <div class="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg mt-4">
    <div class="flex items-center gap-4">
      <img
        :src="user.profile_picture_url || userPlaceholder"
        alt="User Avatar"
        class="w-16 h-16 rounded-full border border-gray-300"
      />
      <div>
        <h1 class="text-xl font-semibold text-gray-800">{{ user.username }}</h1>
        <p class="text-sm text-gray-500">{{ user.email }}</p>
        <p class="text-sm text-gray-500">
          Location: {{ user.location || "Unknown" }}
        </p>
        <p class="text-sm text-gray-500">
          Date of Birth: {{ user.date_of_birth || "Not provided" }}
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
        v-if="user.role?.name === 'admin'"
        class="max-w-xs mt-2"
        title="Go to Admin Panel"
        variant="secondary"
        @click="navigateToAdminPanel"
      />
    </div>

    <!-- Edit Profile Modal -->
    <Dialog v-model:open="editDialogOpen">
      <DialogContent
        class="w-[90vw] max-w-[625px] max-h-[85vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile details. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div class="grid gap-4 py-4">
          <div class="grid gap-2">
            <Label for="email">Email</Label>
            <Input id="email" v-model="editForm.email" />
          </div>
          <div class="grid gap-2">
            <Label for="bio">Bio</Label>
            <Input
              id="bio"
              v-model="editForm.bio"
              placeholder="Enter your bio (optional)"
            />
          </div>
          <div class="grid gap-2">
            <Label for="profilePicture">Profile Picture URL</Label>
            <Input
              id="profilePicture"
              v-model="editForm.profile_picture_url"
              placeholder="Enter profile picture URL"
            />
          </div>
          <div class="grid gap-2">
            <Label for="location">Location</Label>
            <Input
              id="location"
              v-model="editForm.location"
              placeholder="Enter your location (optional)"
            />
          </div>
          <div class="grid gap-2">
            <Label for="website">Website</Label>
            <Input
              id="website"
              v-model="editForm.website"
              placeholder="Enter your website (optional)"
            />
          </div>
          <div class="grid gap-2">
            <Label for="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              v-model="editForm.date_of_birth"
              type="date"
              placeholder="Enter your date of birth (optional)"
            />
          </div>
        </div>
        <DialogFooter class="flex-col-reverse sm:flex-row md:gap-2 sm:gap-0">
          <Button variant="secondary" @click="editDialogOpen = false"
            >Cancel</Button
          >
          <Button type="submit" @click="handleSaveEdit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useAuthStore } from "../store/authStore";
import userPlaceholder from "@/assets/user-placeholder.png";
import { useRouter } from "vue-router";
import Button from "@/components/Button/Button.vue";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { updateUser, getUser } from "@/api/user";
import type { UserType } from "@/models/Auth";

const authStore = useAuthStore();
const router = useRouter();
const queryClient = useQueryClient();

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

const user = ref(
  userData?.value
    ? userData.value
    : {
        username: "Guest User",
        email: "guest@example.com",
        profile_picture_url: "",
        bio: "",
        role: {
          id: 0,
          name: "user",
          description: "",
          level: 0,
        },
        location: "",
        website: "",
        date_of_birth: "",
      }
);

watch(userData, (newData) => {
  if (newData) {
    user.value = newData;
  }
});

const editDialogOpen = ref(false);
const editForm = ref({ ...user.value });

const { mutate: updateUserMutation } = useMutation({
  mutationFn: (updatedUser: Partial<typeof user.value>) => {
    if (!authStore.user) {
      throw new Error("User is not authenticated.");
    }
    const payload = {
      bio: updatedUser.bio,
      date_of_birth: updatedUser.date_of_birth,
      email: updatedUser.email,
      id: authStore.user.id,
      location: updatedUser.location,
      profile_picture_url: updatedUser.profile_picture_url,
      role_id: updatedUser.role?.id || 3,
      website: updatedUser.website,
    };
    return updateUser(authStore.user.id, payload);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["user", authStore.user?.id] });
    editDialogOpen.value = false;
  },
  onError: (error) => {
    console.error("Error updating user profile:", error);
  },
});

function editProfile() {
  editForm.value = { ...user.value };
  editDialogOpen.value = true;
}

function handleSaveEdit() {
  updateUserMutation(editForm.value);
}

function navigateToAdminPanel() {
  router.push("/admin");
}
</script>

<style scoped></style>
