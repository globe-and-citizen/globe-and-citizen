<template>
  <form class="py-3 px-4 flex items-center">
    <label class="sr-only" for="search">Search</label>
    <div class="relative w-full">
      <input
        type="text"
        placeholder="Search"
        class="bg-gray-50 broder border-gray-300 text-gray-900"
        @input="search"
      />
    </div>
  </form>
</template>

<script setup lang="ts">
const emit = defineEmits(["search"]);

const search = (event: Event) => {
  const input = event.target as HTMLInputElement;
  emit("search", input.value);
};
</script>
