<template>
  <div class="border rounded-md bg-white">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-100">
        <tr>
          <th
            class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Title
          </th>
          <th
            class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Author
          </th>
          <th
            class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Date
          </th>
          <th
            class="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Actions
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr
          v-for="opinion in opinions"
          :key="opinion.id"
          class="hover:bg-gray-50"
        >
          <td class="px-3 py-2 whitespace-nowrap">
            <div class="truncate max-w-[200px] md:max-w-[300px] lg:max-w-xs">
              {{ opinion.title }}
            </div>
          </td>
          <td class="px-3 py-2 whitespace-nowrap">
            {{ opinion.user.username || "Unknown" }}
          </td>
          <td class="px-3 py-2 whitespace-nowrap">
            {{ formatDate(opinion.created_at) }}
          </td>
          <td
            class="px-3 py-2 whitespace-nowrap text-right text-sm font-medium"
          >
            <div class="flex space-x-1 justify-end">
              <Button
                variant="ghost"
                size="sm"
                class="h-8 w-8 p-0"
                @click="$emit('preview', opinion)"
              >
                <span class="sr-only">Preview</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                class="h-8 w-8 p-0"
                @click="$emit('edit', opinion)"
              >
                <span class="sr-only">Edit</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  <path d="m15 5 4 4" />
                </svg>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                class="h-8 w-8 p-0 text-destructive hover:text-destructive"
                @click="$emit('delete', opinion)"
              >
                <span class="sr-only">Delete</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
              </Button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { Button } from "@/components/ui/button";
import type { Post } from "@/models/Posts";

interface Props {
  opinions: Post[];
}

interface Emits {
  (e: "preview", opinion: Post): void;
  (e: "edit", opinion: Post): void;
  (e: "delete", opinion: Post): void;
}

defineProps<Props>();
defineEmits<Emits>();

// Function to format date
function formatDate(dateString: string): string {
  if (!dateString) return "Unknown";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}
</script>
