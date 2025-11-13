<template>
  <div class="min-h-[60vh]">
    <h5 class="text-black font-bold text-xl">Change password</h5>

    <!-- Current Password -->
    <div class="grid gap-2 py-4">
      <Label for="currentPassword">Current Password</Label>
      <Input
        id="currentPassword"
        v-model="form.currentPassword"
        type="password"
        placeholder="Enter current password"
      />
      <p v-if="errors.currentPassword" class="text-red-500 text-sm">
        {{ errors.currentPassword }}
      </p>
    </div>

    <!-- New Password -->
    <div class="grid gap-2">
      <Label for="password">New Password</Label>
      <Input
        id="password"
        v-model="form.newPassword"
        type="password"
        placeholder="Enter new password"
      />
      <p v-if="errors.newPassword" class="text-red-500 text-sm">
        {{ errors.newPassword }}
      </p>
    </div>

    <!-- Confirm New Password -->
    <div class="grid gap-2 pt-4">
      <Label for="confirmPassword">Confirm New Password</Label>
      <Input
        id="confirmPassword"
        v-model="form.confirmPassword"
        type="password"
        placeholder="Confirm new password"
      />
      <p v-if="errors.confirmPassword" class="text-red-500 text-sm">
        {{ errors.confirmPassword }}
      </p>
    </div>

    <!-- Save Button -->
    <Button
      size="small"
      class="ml-auto mt-4"
      title="Change password"
      @click="handleSaveEdit"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Button from "../../components/Button.vue";
import { useMutation } from "@tanstack/vue-query";
import { changePassword } from "@/api/auth";
import { toast } from "vue3-toastify";

// reactive form data
const form = ref({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

// error messages
const errors = ref({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

// password validation logic
const validateForm = () => {
  let valid = true;

  // reset errors
  errors.value = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };

  // Current password
  if (!form.value.currentPassword.trim()) {
    errors.value.currentPassword = "Current password is required.";
    valid = false;
  }

  // New password
  if (!form.value.newPassword.trim()) {
    errors.value.newPassword = "New password is required.";
    valid = false;
  } else if (form.value.newPassword.length < 8) {
    errors.value.newPassword = "Password must be at least 8 characters.";
    valid = false;
  }
  //   else if (
  //     !/[A-Z]/.test(form.value.newPassword) ||
  //     !/[0-9]/.test(form.value.newPassword)
  //   ) {
  //     errors.value.newPassword =
  //       "Password must contain at least one uppercase letter and one number.";
  //     valid = false;
  //   }

  // Confirm password
  if (form.value.confirmPassword !== form.value.newPassword) {
    errors.value.confirmPassword = "Passwords do not match.";
    valid = false;
  }

  return valid;
};

const { mutate: changePasswordMutation } = useMutation({
  mutationFn: ({
    old_password,
    new_password,
  }: {
    old_password: string;
    new_password: string;
  }) => changePassword(old_password, new_password),
  onSuccess: () => {
    toast("Password changed successfully!", {
      autoClose: 3000,
      type: "success",
      position: "top-right",
    });
    form.value = { currentPassword: "", newPassword: "", confirmPassword: "" };
  },
  onError: (error: unknown) => {
    toast(`${error}`, {
      autoClose: 3000,
      type: "error",
      position: "top-right",
    });
    console.error("Error changing password:", error);
  },
});

// submit handler
const handleSaveEdit = async () => {
  if (!validateForm()) return;

  try {
    changePasswordMutation({
      old_password: form.value.currentPassword,
      new_password: form.value.newPassword,
    });
  } catch (error) {
    console.error("Error changing password:", error);
  }
};
</script>
