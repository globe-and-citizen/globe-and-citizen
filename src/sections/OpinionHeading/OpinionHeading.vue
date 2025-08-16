<template>
  <div class="bg-black-100 text-white-100 px-4 md:px-8 lg:px-[120px] py-6">
    <div class="mx-auto gc-container text-center">
      <div
        class="underline font-lato underline-offset-4 decoration-primary-red text-heading-h6 font-semibold mb-4"
      >
        Viewpoint by {{ post?.author }}
      </div>
      <h1 class="text-3xl font-bold mb-2"></h1>
      <UserDetailsBlock :user="post?.user" />

      <p class="text-4xl font-bold font-libr mt-5 mb-2">{{ post?.title }}</p>
      <p class="font-lato text-base text-white-60">
        {{ dayjs(post.created_at).format("MMMM D, YYYY") }}
      </p>
    </div>
  </div>
</template>
<script setup lang="ts">
import UserDetailsBlock from "@/components/UserDetailsBlock/UserDetailsBlock.vue";
import type { Post } from "@/models/Posts";
import dayjs from "dayjs";

interface Props {
  post: Post;
}
defineProps<Props>();
</script>
