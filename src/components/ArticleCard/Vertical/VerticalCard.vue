<template>
  <div
    :class="[
      'flex flex-col bg-white overflow-hidden rounded-sm cursor-pointer hover:shadow-card-soft transition',
      {
        'max-w-[276px]': scrollCard,
        'max-w-[378px]': !scrollCard,
      },
    ]"
  >
    <!-- Left Image Section -->
    <div class="h-[200px] relative">
      <img
        :src="
          post?.url_to_image ||
          'https://media.istockphoto.com/id/1409329028/vector/no-picture-available-placeholder-thumbnail-icon-illustration-design.jpg?s=612x612&w=0&k=20&c=_zOuJu755g2eEUioiOUdz_mHKJQJn-tDgIAhQzyeKUQ='
        "
        alt="American Flag"
        class="object-cover h-full w-full rounded-sm"
      />
      <div
        v-if="showWinnerTag"
        class="absolute bottom-4 left-4 bg-white-80 p-1 text-sm font-semibold rounded shadow flex items-center gap-1"
      >
        <component :is="editorsChoice" />
        Editor’s Choice Winner
      </div>
    </div>

    <!-- Right Content Section -->
    <div class="flex-1 py-4 px-2 flex flex-col justify-between">
      <div class="flex items-center gap-2 mb-4">
        <img
          src="https://randomuser.me/api/portraits/men/32.jpg"
          alt="user image"
          class="w-8 h-8 rounded-full"
        />
        <p class="font-semibold font-lato text-black">
          {{ post?.author?.substring(0, 13) + "..." }}
        </p>
        <p class="font-medium text-black-60 font-lato text-xs">
          {{
            post.created_at
              ? new Date(post.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Unknown date"
          }}
        </p>
      </div>

      <h5 class="font-libre text-xl font-medium mb-2">
        {{ post?.title }}
      </h5>
      <p class="text-black-80 mb-3 font-lato font-normal text-base">
        {{ post?.description?.substring(0, 48) + "..." }}
      </p>
      <div v-if="showTags" class="flex gap-3 mb-4 font-lato font-bold text-xs">
        <span
          v-for="(tag, index) in post?.categories"
          :key="index"
          class="text-primary-red text-sm capitalize"
          >{{ tag }}</span
        >
      </div>

      <div
        v-if="showReadingTimeAndComments"
        class="flex items-center text-xs font-medium font-lato text-black-60 gap-4"
      >
        <div class="flex items-center gap-1">
          <component :is="timeIcon" />
          Reading time: 5 minutes
        </div>
        <div class="flex items-center gap-1">
          <component :is="commentsIcon" />
          Discussions: 3
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import editorsChoice from "../../../assets/editors-choice.svg";
import timeIcon from "../../../assets/clock-icon.svg";
import commentsIcon from "../../../assets/comment-icon.svg";
import type { Post } from "@/models/Posts";

withDefaults(
  defineProps<{
    post?: Post;
    showWinnerTag?: boolean;
    showAvatar?: boolean;
    showTags?: boolean;
    showReadingTimeAndComments?: boolean;
    scrollCard?: boolean;
  }>(),
  {
    post: undefined,
    showWinnerTag: false,
    showAvatar: true,
    showTags: true,
    showReadingTimeAndComments: true,
    scrollCard: false,
  }
);
</script>
