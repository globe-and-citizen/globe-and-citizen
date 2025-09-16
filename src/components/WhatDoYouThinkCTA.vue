<template>
  <div
    class="max-w-[379px] shadow-card-soft rounded-md py-6 px-9 justify-items-center"
  >
    <h2 class="text-2xl font-libre font-semibold pb-2">What do you think?</h2>
    <p class="text-base font-lato font-normal pb-4 text-center max-w-[300px]">
      Tell us what you think and offer your point of view on this topic.
    </p>
    <Button
      size="small"
      class="px-6 py-3"
      title="Share your viewpoint"
      @click="$router.push(`/post/${postSlug}/write`)"
    />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";
import Button from "./Button.vue";
const route = useRoute();
const postSlug = route.params.id as string;
</script>
