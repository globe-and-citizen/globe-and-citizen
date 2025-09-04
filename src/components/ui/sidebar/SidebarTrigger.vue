<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import MoreIcon from "@/assets/icons/more-icon.svg";

import { cn } from "@/composables/utils";
import { Button } from "@/components/ui/button";
import { useSidebar } from "./utils";

const props = defineProps<{
  class?: HTMLAttributes["class"];
}>();

const { toggleSidebar } = useSidebar();
</script>

<template>
  <Button
    data-sidebar="trigger"
    data-slot="sidebar-trigger"
    variant="ghost"
    size="icon"
    :class="cn('h-7 w-7 fixed z-50 bottom-4 left-4', props.class)"
    @click="toggleSidebar"
  >
    <component :is="MoreIcon" class="h-4 w-4" />
    <span class="sr-only">Toggle Sidebar</span>
  </Button>
</template>
