<template>
  <div class="flex gap-7">
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
        {{ user?.username.charAt(0).toUpperCase() || "A" }}
      </span>
    </div>
    <div class="font-lato w-full">
      <div class="flex justify-between">
        <p class="font-bold text-2xl">@{{ user?.username }}</p>
        <div
          class="cursor-pointer underline underline-offset-4 decoration-black-100"
          @click="editProfile"
        >
          Edit
        </div>
      </div>
      <p class="text-base font-normal">{{ user?.description }}</p>
      <div class="mt-2">
        <p class="font-normal text-black-40">Bio</p>
        <p class="italic text-black-100">"{{ user?.bio }}"</p>
      </div>
    </div>
  </div>
  <!-- Edit Profile Modal -->
  <Dialog v-model:open="editDialogOpen">
    <DialogContent class="w-[90vw] max-w-[625px] max-h-[85vh] overflow-y-auto">
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
        <!-- description -->
        <div class="grid gap-2">
          <Label for="description">Description</Label>
          <Input
            id="description"
            v-model="editForm.description"
            placeholder="Enter a brief description (optional)"
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
        <Button
          variant="secondary"
          title="Cancel"
          @click="editDialogOpen = false"
        />
        <Button type="submit" title="Save changes" @click="handleSaveEdit" />
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script lang="ts" setup>
import { getUser, updateUser } from "@/api/user";
import type { UserType } from "@/models/Auth";
import { useAuthStore } from "@/store/authStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { generateUserIcon } from "@/lib/utils";
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
import Button from "@/components/Button/Button.vue";
import { ref, watch } from "vue";
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

const editDialogOpen = ref(false);
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
</script>
