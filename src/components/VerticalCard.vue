<template>
  <div
    :class="[
      'flex flex-col overflow-hidden rounded-sm cursor-pointer ',
      {
        'max-w-[276px]': scrollCard,
        'md:max-w-[378px]': !scrollCard,
      },
      noShadow
        ? ''
        : 'hover:shadow-card-soft shadow-card-soft md:shadow-none transition',
    ]"
  >
    <!-- Left Image Section -->
    <div class="h-[160px] relative">
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

    <div class="flex-1 py-4 px-2 flex flex-col">
      <div class="flex items-center gap-2 mb-4">
        <img
          :src="
            post.user?.profile_picture_url ||
            'https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_960_720.png'
          "
          alt="user image"
          class="w-8 h-8 rounded-full object-cover flex-none"
        />
        <p class="font-medium font-lato w-full text-black-80 text-xs">
          {{
            post?.author
              ? post?.author?.substring(0, 13) + "..."
              : post.user.username.substring(0, 20) || "Unknown Author"
          }}
        </p>
        <p class="font-medium text-black-60 font-lato text-xs ml-auto">
          {{
            post.created_at
              ? dayjs(post.created_at).format("M/D/YY")
              : "Unknown date"
          }}
        </p>
      </div>

      <h5 class="font-libre text-small font-semibold mb-2">
        {{ post?.title }}
      </h5>
      <div
        class="text-black-80 mb-3 font-lato font-normal text-base flex-1"
        v-html="
          post?.description.substring(0, 110) + '...' ||
          post?.content.substring(0, 110) + '...' ||
          'No content available'
        "
      />
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
          {{ getReadingTime(post?.content) }} min
        </div>
        <div class="flex items-center gap-1">
          <component :is="commentsIcon" />
          {{ post?.entries_count || 0 }} discussions
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import editorsChoice from "../assets/editors-choice.svg";
import timeIcon from "../assets/clock-icon.svg";
import commentsIcon from "../assets/comment-icon.svg";
import type { Post } from "@/models/Posts";
import dayjs from "dayjs";
import { getReadingTime } from "@/composables/utils";

withDefaults(
  defineProps<{
    post?: Post;
    showWinnerTag?: boolean;
    showAvatar?: boolean;
    showTags?: boolean;
    showReadingTimeAndComments?: boolean;
    scrollCard?: boolean;
    noShadow?: boolean;
  }>(),
  {
    post: undefined,
    showWinnerTag: false,
    showAvatar: true,
    showTags: true,
    showReadingTimeAndComments: true,
    scrollCard: false,
    noShadow: false,
  }
);
</script>
