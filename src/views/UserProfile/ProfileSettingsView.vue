<template>
  <div>
    <RouterLink to="profile-menu" class="block md:hidden cursor-pointer">
      <component :is="arrowBackIcon" class="rotate-180"/>
    </RouterLink>
    <div class="grid grid-cols-1 md:grid-cols-[134px_1fr] gap-4 font-lato">
      <div class="justify-items-center">
        <div
          class="relative group w-[120px] h-[120px] cursor-pointer"
          role="button"
          tabindex="0"
          aria-label="Change profile picture"
          @click="triggerProfileImageSelect"
          @keydown.enter.prevent="triggerProfileImageSelect"
        >
          <img
            v-if="user?.profile_picture_url"
            :src="user?.profile_picture_url"
            alt="User Avatar"
            class="w-[120px] h-[120px] rounded-full object-cover"
          />
          <div
            v-else
            class="w-[120px] h-[120px] rounded-full flex items-center justify-center flex-shrink-0"
            :style="generateUserIcon(user?.username || 'A')"
          >
            <span class="text-black text-2xl font-semibold">
              {{ user?.username?.charAt(0).toUpperCase() || "A" }}
            </span>
          </div>
          <div
            class="absolute inset-0 rounded-full bg-black/55 text-white flex items-center justify-center text-xs sm:text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <div
              v-if="!isUploadingProfileImage"
              class="flex flex-col items-center gap-1"
            >
              <span class="text-base font-semibold">Edit</span>
            </div>
            <div
              v-else
              class="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"
            ></div>
          </div>
          <input
            ref="profileImageInputRef"
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleProfileImageChange"
          />
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
                disabled
                placeholder="Enter your username"
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
              <Label for="dateOfBirth"
              >Date of Birth <i>(coming soon)</i></Label
              >
              <Input
                id="dateOfBirth"
                v-model="editForm.date_of_birth"
                type="date"
                disabled
                placeholder="Enter your date of birth (optional)"
              />
            </div>
          </div>
        </div>
        <div></div>
        <div>
          <h5 class="text-black font-bold text-xl mt-8">
            Layer8 Provided Metadata
          </h5>
          <div class="grid gap-4 py-4">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-2">
              <div class="grid gap-2">
                <Label for="username">Display name</Label>
                <Input
                  id="displayName"
                  v-model="layer8_metadata.display_name"
                  disabled
                />
              </div>
              <div class="grid gap-2">
                <Label for="color">Color</Label>
                <Input id="color" v-model="layer8_metadata.favorite_color" disabled/>
              </div>

              <div class="grid gap-2">
                <Label for="location">Location</Label>
                <Input id="country" v-model="country" disabled/>
              </div>
            </div>

            <div class="grid gap-2">
              <Label for="bio">Bio (provided from Layer8)</Label>
              <Textarea
                id="bio"
                v-model="layer8_metadata.bio"
                class="min-h-[84px]"
                disabled
                placeholder="Enter your bio (optional)"
              />
<!--              <div class="text-xs text-[#8F8F8F] text-start mt-1">-->
<!--                Last updated:-->
<!--                {{ formatVerifiedAt(layer8_metadata.bio_layer8_updated_at) || "never" }}-->
<!--              </div>-->
            </div>
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
import {getUser, updateUser} from "@/api/user.ts";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import type {Layer8Metadata, UserType} from "@/models/Auth";
import {useAuthStore} from "@/store/authStore.ts";
import {useMutation, useQuery, useQueryClient} from "@tanstack/vue-query";
import {computed, ref, watch} from "vue";
import Button from "../../components/Button.vue";
import {generateUserIcon} from "@/composables/utils.ts";
import Textarea from "../../components/ui/textarea/Textarea.vue";
import {toast} from "vue3-toastify";
import arrowBackIcon from "../../assets/arrow-back.svg";
import {RouterLink} from "vue-router";
import {uploadToCloudinary} from "@/api/images.ts";
import {countries} from "@/composables/countries.ts";

const queryClient = useQueryClient();
const authStore = useAuthStore();
const {data: userData} = useQuery({
  queryKey: ["user", authStore.user?.username],
  queryFn: async () => {
    if (!authStore.user?.username) {
      throw new Error("User username is not available.");
    }
    const response = await getUser(authStore.user.username);
    console.log(response);
    return response as Partial<UserType>;
  },
  enabled: !!authStore.user?.username,
});
// State for inline avatar upload
const isUploadingProfileImage = ref(false);
const profileImageInputRef = ref<HTMLInputElement | null>(null);

const user = ref(
  userData?.value
    ? userData.value
    : {
      username: "Guest User",
      email: "guest@example.com",
      profile_picture_url: "",
      role: {
        id: 0,
        name: "user",
        description: "",
        level: 0,
      },
      website: "",
      date_of_birth: "",
      description: "",
      layer8_metadata: {
        display_name: "",
        // display_name_updated_at: null,
        bio: "",
        // bio_layer8_updated_at: null,
        favorite_color: "",
        // favorite_color_updated_at: null,
        is_email_verified: false,
        // is_email_verified_updated_at: null,
        location: "",
        // location_updated_at: null,
        updated_at: "",
      }
    }
);

const layer8_metadata = ref<Layer8Metadata>({
  display_name: user.value.layer8_metadata?.display_name || "",
  bio: user.value.layer8_metadata?.bio || "",
  favorite_color: user.value.layer8_metadata?.favorite_color || "",
  is_email_verified: user.value.layer8_metadata?.is_email_verified || false,
  location: user.value.layer8_metadata?.location || "",
  updated_at: user.value.updated_at || "",
})

const editForm = ref({
  ...user.value,
});

const {mutate: updateUserMutation} = useMutation({
  mutationFn: (updatedUser: Partial<typeof user.value>) => {
    if (!authStore.user) {
      throw new Error("User is not authenticated.");
    }
    const payload = {
      description: updatedUser.description,
      date_of_birth: updatedUser.date_of_birth,
      email: updatedUser.email,
      id: authStore.user.id,
      profile_picture_url: updatedUser.profile_picture_url,
      role_id: updatedUser.role?.id || 3,
      website: updatedUser.website,
      username: updatedUser.username,
    };
    return updateUser(authStore.user.username, payload);
  },
  onSuccess: (res: unknown) => {
    // Attempt to update auth store user instantly if API returns user
    let updatedUser: Partial<UserType> | undefined;
    if (
      typeof res === "object" &&
      res !== null &&
      "data" in res &&
      typeof (res as { data?: unknown }).data === "object" &&
      (res as { data?: { user?: unknown } }).data?.user &&
      typeof (res as { data: { user: unknown } }).data.user === "object"
    ) {
      updatedUser = (res as { data: { user: Partial<UserType> } }).data.user;
    }
    if (
      updatedUser &&
      typeof updatedUser.id === "number" &&
      typeof updatedUser.username === "string" &&
      typeof updatedUser.email === "string"
    ) {
      authStore.setUser(updatedUser as UserType);
      user.value = {...user.value, ...updatedUser} as UserType;
      editForm.value = {...editForm.value, ...updatedUser};
    }
    queryClient.invalidateQueries({queryKey: ["user"]});
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
    editForm.value = {
      ...newData,
    };
    layer8_metadata.value = {
      display_name: newData.layer8_metadata?.display_name || "",
      bio: newData.layer8_metadata?.bio || "",
      favorite_color: newData.layer8_metadata?.favorite_color || "",
      is_email_verified: newData.layer8_metadata?.is_email_verified || false,
      location: newData.layer8_metadata?.location || "",
      updated_at: newData.layer8_metadata?.updated_at || "",
    }
  }
  console.log("newData", newData);
  console.log("user", user.value);
  console.log("layer8_metadata", layer8_metadata.value);
});

const country = computed(() => {
  return countries.find(c => c.code === userData.value?.layer8_metadata?.location)?.country || 'The Moon'
});

function handleSaveEdit() {
  updateUserMutation(editForm.value);
}

function triggerProfileImageSelect() {
  profileImageInputRef.value?.click();
}

async function handleProfileImageChange(e: Event) {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  isUploadingProfileImage.value = true;
  try {
    const url = await uploadToCloudinary(file);
    editForm.value.profile_picture_url = url;
    if (user.value) {
      user.value.profile_picture_url = url as string;
    }
    updateUserMutation(editForm.value);
    toast("Profile picture updated!", {autoClose: 3000, type: "success"});
  } catch (error) {
    console.error("Profile picture upload failed:", error);
    toast("Profile picture upload failed", {autoClose: 3000, type: "error"});
  } finally {
    isUploadingProfileImage.value = false;
    if (profileImageInputRef.value) profileImageInputRef.value.value = "";
  }
}

const formatVerifiedAt = (timestamp?: string | null) => {
  if (!timestamp) return ''

  const date = new Date(timestamp)

  const pad = (value: number, digits = 2) =>
    String(value).padStart(digits, '0')

  const offsetMinutes = -date.getTimezoneOffset()
  const sign = offsetMinutes >= 0 ? '+' : '-'
  const offsetHours = Math.floor(Math.abs(offsetMinutes) / 60)

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} at ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())} GMT${sign}${offsetHours}`
}
</script>

<style scoped>
input:read-only,
textarea:read-only {
  box-shadow: none;
  background-color: rgb(243, 243, 243);
}
</style>
