<template>
  <DropdownMenu class="text-end">
    <DropdownMenuTrigger as-child class="bg-gray-100 cursor-pointer float-end">
      <Button variant="ghost" class="h-8 w-8 p-0">
        <span class="sr-only">Open menu</span>
        <component
          :is="ChevronDown"
          class="h-4 w-4 text-gray-500 hover:text-gray-700 transition-colors"
        />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-48 text-center">
      <DropdownMenuItem @click="handleView" class="flex items-center">
        View profile
      </DropdownMenuItem>
      <DropdownMenuItem @click="handleEdit" class="flex items-center">
        Edit user
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        class="text-destructive focus:text-destructive flex items-center"
        @click="handleDeactivate"
      >
        Deactivate user
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup lang="ts">
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import ChevronDown from "@/assets/icons/chevron-down.svg";
import type { UserType } from "@/models/Auth";

const props = defineProps<{
  user: UserType;
  onExpand: () => void;
  onEdit: (user: UserType) => void;
  onDeactivate: (user: UserType) => void;
}>();

function handleView() {
  // Navigate to user profile page
  window.open(`/profile/${props.user.id}`, "_blank");
}
console.log("DropdownAction component loaded");
function handleEdit() {
  props.onEdit(props.user);
}

function handleDeactivate() {
  props.onDeactivate(props.user);
}
</script>
