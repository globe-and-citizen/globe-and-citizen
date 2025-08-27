<template>
  <div>
    <RouterLink to="profile-menu" class="block md:hidden cursor-pointer">
      <component :is="arrowBackIcon" class="rotate-180" />
    </RouterLink>
    <div class="grid grid-cols-1 md:grid-cols-[134px_1fr] gap-4 font-lato">
      <div class="justify-items-center">
        <img
          v-if="user?.profile_picture_url"
          :src="user?.profile_picture_url"
          alt="User Avatar"
          class="w-[120px] h-[120px] rounded-full"
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
      <div>
        <h5 class="text-black font-bold text-xl">Profile Info</h5>
        <div class="grid gap-4 py-4">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-2">
            <div class="grid gap-2">
              <Label for="username">Username</Label>
              <Input
                id="username"
                v-model="editForm.username"
                readonly
                placeholder="Enter your username"
                class=":readonly:bg-gray-100"
              />
            </div>
            <div class="grid gap-2">
              <Label for="email">Email</Label>
              <Input
                id="email"
                v-model="editForm.email"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div class="grid gap-2">
            <Label for="bio">Bio (optional)</Label>
            <Textarea
              id="bio"
              v-model="editForm.bio"
              class="min-h-[84px]"
              placeholder="Enter your bio (optional)"
            />
          </div>
          <!-- description -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-2">
            <div class="grid gap-2">
              <Label for="description">Job Role</Label>
              <Input
                id="description"
                v-model="editForm.description"
                placeholder="Enter a brief description (optional)"
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
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-2">
            <div class="grid gap-2">
              <Label for="location">Location</Label>
              <Input
                id="location"
                v-model="editForm.location"
                placeholder="Enter your location (optional)"
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

          <div class="grid gap-2">
            <Label for="profilePicture">Profile Picture URL</Label>
            <Input
              id="profilePicture"
              v-model="editForm.profile_picture_url"
              placeholder="Enter profile picture URL"
            />
          </div>
        </div>
        <Button
          size="small"
          class="ml-auto"
          title="Save Changes"
          @click="handleSaveEdit"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { getUser, updateUser } from "@/api/user";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UserType } from "@/models/Auth";
import { useAuthStore } from "@/store/authStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { ref, watch } from "vue";
import Button from "../Button/Button.vue";
import { generateUserIcon } from "@/lib/utils";
import Textarea from "../ui/textarea/Textarea.vue";
import { toast } from "vue3-toastify";
import arrowBackIcon from "../../assets/arrow-back.svg";
import { RouterLink } from "vue-router";

const queryClient = useQueryClient();
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

const editForm = ref({ ...user.value });

const { mutate: updateUserMutation } = useMutation({
  mutationFn: (updatedUser: Partial<typeof user.value>) => {
    if (!authStore.user) {
      throw new Error("User is not authenticated.");
    }
    const payload = {
      bio: updatedUser.bio,
      description: updatedUser.description,
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
    toast("Profile updated successfully!", {
      autoClose: 3000,
      type: "success",
      position: "top-right",
    });
  },
  onError: (error) => {
    console.error("Error updating user profile:", error);
    toast("Error updating profile. Please try again.", {
      autoClose: 3000,
      type: "error",
      position: "top-right",
    });
  },
});

watch(userData, (newData) => {
  if (newData) {
    user.value = newData;
    editForm.value = { ...newData };
  }
});

function handleSaveEdit() {
  updateUserMutation(editForm.value);
}
</script>

<style scoped>
input:read-only,
textarea:read-only {
  box-shadow: none;
  background-color: rgb(243, 243, 243);
}
</style>
